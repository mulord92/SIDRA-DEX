// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {TokenRegistry} from "../contracts/TokenRegistry.sol";
import {PairRegistry} from "../contracts/PairRegistry.sol";
import {VerifiedSwapRouter} from "../contracts/VerifiedSwapRouter.sol";
import {VerifiedLiquidityPool} from "../contracts/VerifiedLiquidityPool.sol";
import {PaymentProcessor} from "../contracts/PaymentProcessor.sol";

contract MockERC20 is IERC20 {
    string public name; string public symbol; uint8 public immutable decimals;
    uint256 public totalSupply; mapping(address=>uint256) public balanceOf; mapping(address=>mapping(address=>uint256)) public allowance;
    constructor(string memory n,string memory s,uint8 d){name=n;symbol=s;decimals=d;}
    function transfer(address to,uint256 a) external returns(bool){_transfer(msg.sender,to,a);return true;}
    function approve(address s,uint256 a) external returns(bool){allowance[msg.sender][s]=a;emit Approval(msg.sender,s,a);return true;}
    function transferFrom(address f,address t,uint256 a) external returns(bool){require(allowance[f][msg.sender]>=a,"allowance");allowance[f][msg.sender]-=a;_transfer(f,t,a);return true;}
    function mint(address to,uint256 a) external {balanceOf[to]+=a;totalSupply+=a;emit Transfer(address(0),to,a);}
    function _transfer(address f,address t,uint256 a) internal {require(balanceOf[f]>=a,"balance");balanceOf[f]-=a;balanceOf[t]+=a;emit Transfer(f,t,a);}
    event Transfer(address indexed from,address indexed to,uint256 value); event Approval(address indexed owner,address indexed spender,uint256 value);
}

contract AntiFakeTokenTest is Test {
    TokenRegistry registry; PairRegistry pairs; VerifiedSwapRouter router; PaymentProcessor payments;
    MockERC20 sidra; MockERC20 usdt; MockERC20 fake;
    address admin=address(1); address alice=address(2); address merchant=address(3);

    function setUp() public {
        vm.startPrank(admin);
        registry=new TokenRegistry(admin); pairs=new PairRegistry(admin); router=new VerifiedSwapRouter(address(registry),address(pairs)); payments=new PaymentProcessor(address(registry));
        sidra=new MockERC20("Sidra","SDA",18); usdt=new MockERC20("Tether","USDT",6); fake=new MockERC20("Sidra","SDA",18);
        registry.addToken(address(sidra),18,"SDA"); registry.addToken(address(usdt),6,"USDT");
        vm.stopPrank();
        sidra.mint(alice,1_000_000 ether); usdt.mint(alice,1_000_000e6); fake.mint(alice,1_000_000 ether);
    }

    function testFakeTokenRejected() public view { assertFalse(registry.isSupported(address(fake))); }

    function testVerifiedTokensAccepted() public view { assertTrue(registry.isSupported(address(sidra))); assertTrue(registry.isSupported(address(usdt))); }

    function testPausedTokenRejected() public {
        vm.prank(admin); registry.pauseToken(address(sidra));
        assertFalse(registry.isSupported(address(sidra)));
    }

    function testPaymentRejectsFakeToken() public {
        vm.prank(alice); fake.approve(address(payments),100 ether);
        vm.expectRevert(bytes("Payment token unsupported"));
        vm.prank(alice); payments.pay(keccak256("ORDER-1"),address(fake),merchant,100 ether);
    }

    function testPaymentPreventsReplay() public {
        sidra.mint(alice,100 ether);
        vm.prank(alice); sidra.approve(address(payments),100 ether);
        bytes32 id=keccak256("ORDER-2");
        vm.prank(alice); payments.pay(id,address(sidra),merchant,100 ether);
        vm.expectRevert(bytes("Order already paid"));
        vm.prank(alice); payments.pay(id,address(sidra),merchant,100 ether);
    }

    function testFuzzFakeNeverSupported(address token) public view {
        if(token==address(sidra)||token==address(usdt)) return;
        assertFalse(registry.isSupported(token));
    }
}
