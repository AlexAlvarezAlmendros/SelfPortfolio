---
title: "GitHub on the blockchain?"
slug: "github-blockchain"
lang: en
tag: "BLOCKCHAIN"
date: 2026-06-18
read: "8 min"
excerpt: "Linking GitHub repos to Ethereum to handle bounties and high-level decisions between maintainers."
order: 1
---
The other day I ran into someone arguing that GitHub doesn't mean open source. A slightly odd and fairly obvious statement for those of us who've been at this a while, but it got me thinking.

## The idea

I started turning over the whole open source thing and how the idea of software being free fits surprisingly well with decentralization and blockchain networks. If the code belongs to everyone, why do the decisions and the money around it still go through middlemen?

That's where the question came from: what if I built a project that links and manages GitHub repos on top of the Ethereum network? Something to handle the parts that today are a mess of trust and paperwork:

- **Bounties** paid out transparently and without intermediaries.
- **High-level decisions** between a repo's maintainers, recorded on-chain.
- **Portable reputation** for the devs who actually contribute.

## Time to dig in

I rolled up my sleeves and started researching and, to my surprise, nobody seems to have done anything quite like this with this angle. That motivated me even more: if the gap is empty, either nobody cares or nobody has dared. I'm betting on the latter.

```solidity
// A bounty that only releases once the PR is merged
function claimBounty(bytes32 repoId, uint256 prId) external nonReentrant {
    require(isMerged(repoId, prId), "PR not merged");
    pendingWithdrawals[msg.sender] += bounties[repoId][prId];
}
```

> Open source solved who gets to read the code. What's left is solving who decides and who gets paid.

Turning licenses into executable contracts, bounties into something without middlemen, and reputation into something the dev carries with them: that's where I see the potential. I'm in the thick of building it, so I'll keep posting how it goes here.
