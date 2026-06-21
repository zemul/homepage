---
title: "Turning Codex into a Mobile Server Ops Entry Point"
date: "2026-06"
description: "How I connected two U.S. servers to Codex remote control so I can handle routine server operations from my phone, with shared auth, server runbooks, auto-approval, and mutual Watchdog checks."
lang: en
tags: ["AI", "Codex", "Operations"]
cover: "/blog/202606/codex-remote-server-ops-cover.png"
---

I recently connected two U.S. servers to Codex remote control. For me, this turned out to be a pretty meaningful change.

Before this, my server maintenance workflow was basically fixed: open my MacBook Pro, SSH from the laptop into a specific server, check logs, update configs, restart services. That worked, but it had one obvious condition: the laptop had to be with me.

Then I started thinking differently: what if a server itself could become the operations entry point?

This is not a complete tutorial. It is closer to a record of how I set up my own workflow. Everyone's servers, accounts, network environment, and risk boundaries are different, so copying every detail is not useful. But the direction is reusable: keep Codex running on a trusted server, then let that server connect to the rest of the fleet.

<style>
  .ops-flow {
    --flow-border: color-mix(in oklab, var(--border-subtle) 82%, transparent);
    --flow-panel: color-mix(in oklab, var(--panel-subtle) 76%, transparent);
    --flow-panel-strong: color-mix(in oklab, var(--accent) 9%, var(--panel-subtle));
    --flow-muted: var(--text-secondary);
    margin: 1.6rem 0 2rem;
    border: 1px solid var(--flow-border);
    border-radius: 18px;
    background:
      radial-gradient(circle at top left, color-mix(in oklab, var(--accent) 14%, transparent), transparent 30%),
      var(--flow-panel);
    padding: 1.15rem;
    box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
  }

  .ops-flow__title {
    margin: 0 0 1rem;
    color: var(--text-primary);
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0;
  }

  .ops-flow__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: stretch;
    gap: 0.8rem;
  }

  .ops-flow__grid--three {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
  }

  .ops-flow__grid--two {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .ops-flow__node {
    min-width: 0;
    border: 1px solid var(--flow-border);
    border-radius: 14px;
    background: color-mix(in oklab, var(--background) 78%, transparent);
    padding: 0.9rem;
  }

  .ops-flow__node--strong {
    background: var(--flow-panel-strong);
    border-color: color-mix(in oklab, var(--accent) 34%, var(--flow-border));
  }

  .ops-flow__kicker {
    display: block;
    margin-bottom: 0.28rem;
    color: var(--flow-muted);
    font-size: 0.72rem;
  }

  .ops-flow__name {
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 800;
    line-height: 1.25;
  }

  .ops-flow__desc {
    margin-top: 0.38rem;
    color: var(--flow-muted);
    font-size: 0.76rem;
    line-height: 1.55;
  }

  .ops-flow__arrow {
    align-self: center;
    color: var(--accent);
    font-weight: 800;
    line-height: 1;
    opacity: 0.9;
  }

  .ops-flow__stack {
    display: grid;
    gap: 0.55rem;
  }

  .ops-flow__pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin-top: 0.65rem;
  }

  .ops-flow__pill {
    border: 1px solid color-mix(in oklab, var(--accent) 26%, var(--flow-border));
    border-radius: 999px;
    color: var(--text-primary);
    background: color-mix(in oklab, var(--accent) 8%, transparent);
    padding: 0.2rem 0.55rem;
    font-size: 0.72rem;
    line-height: 1.3;
  }

  .ops-flow__steps {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .ops-flow__step {
    position: relative;
    border: 1px solid var(--flow-border);
    border-radius: 14px;
    background: color-mix(in oklab, var(--background) 78%, transparent);
    padding: 0.9rem 0.8rem;
  }

  .ops-flow__step::after {
    content: "→";
    position: absolute;
    top: 50%;
    right: -0.55rem;
    transform: translate(50%, -50%);
    color: var(--accent);
    font-weight: 800;
  }

  .ops-flow__step:last-child::after {
    content: "";
  }

  .ops-flow__step-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.45rem;
    height: 1.45rem;
    margin-bottom: 0.55rem;
    border-radius: 999px;
    background: var(--accent);
    color: var(--background);
    font-size: 0.72rem;
    font-weight: 800;
  }

  .ops-flow__step-title {
    color: var(--text-primary);
    font-size: 0.84rem;
    font-weight: 800;
    line-height: 1.35;
  }

  .ops-flow__step-desc {
    margin-top: 0.3rem;
    color: var(--flow-muted);
    font-size: 0.72rem;
    line-height: 1.45;
  }

  .ops-flow__matrix {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0.85rem;
  }

  .ops-flow__watchdog {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 0.8rem;
    align-items: center;
  }

  .ops-flow__rail {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 3rem;
    color: var(--accent);
    font-size: 1.2rem;
    font-weight: 800;
  }

  .ops-flow__caption {
    margin: 0.9rem 0 0;
    color: var(--flow-muted);
    font-size: 0.75rem;
    line-height: 1.55;
  }

  @media (max-width: 720px) {
    .ops-flow {
      padding: 1rem;
      border-radius: 16px;
    }

    .ops-flow__grid,
    .ops-flow__grid--three,
    .ops-flow__grid--two,
    .ops-flow__watchdog,
    .ops-flow__matrix,
    .ops-flow__steps {
      grid-template-columns: 1fr;
    }

    .ops-flow__arrow,
    .ops-flow__rail {
      min-height: auto;
      transform: rotate(90deg);
    }

    .ops-flow__step::after {
      top: auto;
      right: 50%;
      bottom: -0.7rem;
      transform: translate(50%, 50%) rotate(90deg);
    }
  }
</style>

## The Original Maintenance Model

The original structure was simple: my MacBook Pro connected to every server.

<div class="ops-flow">
  <p class="ops-flow__title">Early model: local machine connects to the whole fleet</p>
  <div class="ops-flow__grid">
    <div class="ops-flow__node ops-flow__node--strong">
      <span class="ops-flow__kicker">Only entry point</span>
      <div class="ops-flow__name">MacBook Pro</div>
      <div class="ops-flow__desc">Login, SSH, logs, and config changes all start from the laptop.</div>
    </div>
    <div class="ops-flow__arrow">SSH →</div>
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Server fleet</span>
      <div class="ops-flow__name">HK / US / JP / UK / CN</div>
      <div class="ops-flow__pill-row">
        <span class="ops-flow__pill">Dashboard</span>
        <span class="ops-flow__pill">Websites</span>
        <span class="ops-flow__pill">Agents</span>
        <span class="ops-flow__pill">Proxy services</span>
      </div>
    </div>
  </div>
  <p class="ops-flow__caption">This setup is simple, but the maintenance entry point is tightly coupled to my MacBook Pro.</p>
</div>

When I was at my desk, this was perfectly fine. The problem was that once I was away from the laptop, or the laptop was not running, most maintenance work became hard to continue.

Of course, I could use a mobile SSH client. But the experience is not good enough. It works for checking status, but once I want an AI agent to analyze logs, edit configs, compare docs, or preserve context, it becomes awkward. AI agents are at their best when they can read files, run commands, and keep the working context in one place.

So the first step was to turn one U.S. server into an operations entry point.

<div class="ops-flow">
  <p class="ops-flow__title">Phase one: one server becomes the persistent ops entry point</p>
  <div class="ops-flow__grid ops-flow__grid--three">
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Mobile entry</span>
      <div class="ops-flow__name">Codex on phone</div>
      <div class="ops-flow__desc">Enters the remote session; it does not directly maintain every server.</div>
    </div>
    <div class="ops-flow__arrow">Remote →</div>
    <div class="ops-flow__node ops-flow__node--strong">
      <span class="ops-flow__kicker">Persistent environment</span>
      <div class="ops-flow__name">U.S. Server A</div>
      <div class="ops-flow__desc">Stores SSH keys, server runbooks, and fixed operations directories.</div>
    </div>
    <div class="ops-flow__arrow">SSH →</div>
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Targets</span>
      <div class="ops-flow__name">Other servers</div>
      <div class="ops-flow__desc">Reached through U.S. Server A for routine checks and maintenance.</div>
    </div>
  </div>
</div>

After that, I could open Codex on my phone and enter U.S. Server A directly. That server already had the SSH keys, server notes, and working directories it needed to continue connecting to the rest of the fleet.

This changed the feeling of maintenance quite a bit. It went from "I must open my MacBook Pro" to "I just need to open my phone."

## Why I Added a Second U.S. Server

Having only one entry server still has a problem. If the Codex remote process on that machine goes down while I am away, my phone cannot get back in.

So I connected a second U.S. server to Codex as well. The structure became this:

<div class="ops-flow">
  <p class="ops-flow__title">Phase two: two entries with mutual fallback</p>
  <div class="ops-flow__grid ops-flow__grid--three">
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Mobile entry</span>
      <div class="ops-flow__name">Codex on phone</div>
      <div class="ops-flow__desc">Both U.S. servers stay visible in the remote list.</div>
    </div>
    <div class="ops-flow__arrow">Enter →</div>
    <div class="ops-flow__stack">
      <div class="ops-flow__node ops-flow__node--strong">
        <span class="ops-flow__kicker">Entry A</span>
        <div class="ops-flow__name">US-DMIT</div>
        <div class="ops-flow__desc">One routine operations entry point; also checks Entry B.</div>
      </div>
      <div class="ops-flow__node ops-flow__node--strong">
        <span class="ops-flow__kicker">Entry B</span>
        <div class="ops-flow__name">US-Hetzner</div>
        <div class="ops-flow__desc">Core web server, with stricter operational boundaries.</div>
      </div>
    </div>
    <div class="ops-flow__arrow">SSH →</div>
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Targets</span>
      <div class="ops-flow__name">All servers</div>
      <div class="ops-flow__desc">HK, JP, UK, CN, and the remaining U.S. nodes.</div>
    </div>
  </div>
  <div class="ops-flow__watchdog" style="margin-top: 0.85rem;">
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Watchdog</span>
      <div class="ops-flow__name">A checks B</div>
    </div>
    <div class="ops-flow__rail">↔</div>
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Watchdog</span>
      <div class="ops-flow__name">B checks A</div>
    </div>
  </div>
</div>

Both U.S. servers are now in my remote list on the phone. In daily use, I can enter either one. If the Codex process on one server goes down, the other one still has a chance to bring it back.

![Codex remote entries on my phone](./codex-remote-entries.jpg)

On my phone, I can now see MacBook Pro, US-DMIT, and US-Hetzner at the same time. This is no longer just "remote access to one server." It is a set of always-available operations entries.

The key point is not simply "adding one more server." The key point is making the entry point redundant. For server operations, the worst failure is not always a broken service. Sometimes the real problem is losing the path you need in order to fix it.

## MacBook Pro as the Auth Source

One important detail: I switch Codex accounts.

If every server has to be manually logged in, switching accounts becomes painful. The better model is to treat the MacBook Pro as the auth source. I do daily login and account switching on the MacBook Pro first, then sync only the necessary auth files to the servers.

Codex stores local login state under the local config directory, such as `~/.codex/auth.json`. This kind of file is a credential. It should not be treated like ordinary configuration.

My sync flow looks roughly like this:

<div class="ops-flow">
  <p class="ops-flow__title">Auth sync: switch locally, let servers inherit the session</p>
  <div class="ops-flow__steps">
    <div class="ops-flow__step">
      <span class="ops-flow__step-index">1</span>
      <div class="ops-flow__step-title">Switch locally</div>
      <div class="ops-flow__step-desc">Log into Codex on the MacBook Pro first.</div>
    </div>
    <div class="ops-flow__step">
      <span class="ops-flow__step-index">2</span>
      <div class="ops-flow__step-title">Verify it works</div>
      <div class="ops-flow__step-desc">Make sure the local session is the right one.</div>
    </div>
    <div class="ops-flow__step">
      <span class="ops-flow__step-index">3</span>
      <div class="ops-flow__step-title">Sync credentials</div>
      <div class="ops-flow__step-desc">Sync only auth.json and necessary config.</div>
    </div>
    <div class="ops-flow__step">
      <span class="ops-flow__step-index">4</span>
      <div class="ops-flow__step-title">Restart remote process</div>
      <div class="ops-flow__step-desc">Let the server load the new auth file.</div>
    </div>
    <div class="ops-flow__step">
      <span class="ops-flow__step-index">5</span>
      <div class="ops-flow__step-title">Check from phone</div>
      <div class="ops-flow__step-desc">Confirm the remote entry appears again.</div>
    </div>
  </div>
</div>

I do not copy the entire `~/.codex` directory. It contains logs, history, local databases, and cache files. There is no need to sync all of that to a server. Usually, the only files worth syncing are the auth file and a small amount of configuration that really needs to stay consistent, such as `config.toml`.

I think of auth sync as a separate operation: switch accounts locally, then let the servers inherit that login state. When I change Codex accounts later, I only need to handle it once on the MacBook Pro, then push the auth JSON to the two entry servers.

This is also the highest-risk step. `auth.json` should not go into Git, should not be placed in public directories, should not be written into docs, and should not be captured by careless backups. On the server, file permissions should also be restricted so only the user running Codex can read it.

## Installation Source Matters

Codex updates quickly, so I prefer to keep the installation source consistent.

As of 2026-06, the [official Codex CLI documentation](https://developers.openai.com/codex/cli) recommends the standalone installer for macOS and Linux:

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

For automation, the official docs also describe non-interactive installation. To upgrade the standalone version, just run the installer again.

I would not casually install a random npm package found through search on a server. Codex CLI does have an official npm package, `@openai/codex`, but if you are just searching by package name, it is easy to install from the wrong source or end up with a version you did not intend to run. For a long-running remote entry point, I prefer to follow the current official installation path. It also makes automated upgrades simpler.

## A Server Runbook Written for AI

Once Codex is running on a server, another thing becomes important: give it a server runbook.

This is not a README for humans. It is operational context for an AI agent. At minimum, it should include:

- Which server this is and what role it plays.
- Other server IPs, purposes, and SSH methods.
- Where SSH keys live and what file permissions they should have.
- Which services can be inspected freely, and which services should not be restarted casually.
- Which machines run core business services and require extra caution.

I ran into a naming problem myself. In a proxy-related conversation, "U.S. server 1" might mean DMIT. But in daily operations, "U.S. server 1" might mean the stronger Hetzner machine that runs core websites. Humans understand context. AI may not.

So in the runbook, I try to avoid casual nicknames and write IPs, domains, roles, and boundaries clearly. If a server runs the main website, the runbook should explicitly say: do not restart website-related services unless the user asks for it directly.

The clearer this file is, the steadier AI-assisted operations become.

## Permission Mode

My own habit is to set Codex to "approve for me" on trusted servers. That way, when I am doing maintenance from my phone, I do not need to approve every single command manually.

This is convenient, but it only belongs on your own trusted servers. Once permissions are opened up, Codex can really perform many actions. It can read logs, but it can also delete files. It can restart services, but it can also change configs.

So the prerequisites matter: the servers are mine, the SSH keys are mine, auth files only move between trusted machines, and the runbooks clearly describe which things should not be touched casually.

For team machines, client machines, or production database machines, I would not enable this mode by default.

## How I Think About Watchdog

The last piece is Watchdog.

At first, I considered letting each server check its own Codex process and restart it if needed. But there is a problem with that model: if its own upgrade fails, or the process management script breaks, it may no longer be able to "check itself" at all.

So I prefer two servers checking each other.

<div class="ops-flow">
  <p class="ops-flow__title">Watchdog: check each other, not only yourself</p>
  <div class="ops-flow__watchdog">
    <div class="ops-flow__node ops-flow__node--strong">
      <span class="ops-flow__kicker">US-DMIT</span>
      <div class="ops-flow__name">Checks US-Hetzner</div>
      <div class="ops-flow__desc">Version, process, remote entry, and recovery after upgrade.</div>
    </div>
    <div class="ops-flow__rail">↔</div>
    <div class="ops-flow__node ops-flow__node--strong">
      <span class="ops-flow__kicker">US-Hetzner</span>
      <div class="ops-flow__name">Checks US-DMIT</div>
      <div class="ops-flow__desc">Also handles upgrade, restart, and failure logging.</div>
    </div>
  </div>
  <div class="ops-flow__matrix" style="margin-top: 0.85rem;">
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Checks</span>
      <div class="ops-flow__name">Process / Version / Entry</div>
      <div class="ops-flow__desc">Do not only check whether a process exists. Confirm the phone can still enter.</div>
    </div>
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Failure handling</span>
      <div class="ops-flow__name">Leave logs for manual recovery</div>
      <div class="ops-flow__desc">Automation should only do low-risk recovery, not expand the blast radius.</div>
    </div>
  </div>
</div>

The Watchdog does not need to be complex:

- Check whether the Codex remote process exists on the other server.
- Check whether Codex needs an upgrade.
- If upgraded, restart the remote process.
- After restart, confirm the remote entry is back.
- If something fails, leave logs so I can take over manually.

The upgrade flow is the most important part. Codex updates frequently, so checking once per day and upgrading automatically when a new version appears feels natural. But if a machine only upgrades itself, it may finish the upgrade and fail to bring the remote process back. From the phone, that machine is then unreachable.

With two servers backing each other up, the risk is much smaller. A upgrades B, and B upgrades A. Even if one side fails, the other side is still there.

## What This Setup Is Good For

For me, this setup is best for lightweight daily operations.

For example: checking why a server is using too much memory, seeing whether a Docker container is running, verifying Nginx config, restarting a non-core service, reading scheduled job logs, or asking AI to reason through a migration based on project docs.

These are things that used to require sitting in front of the laptop. Now, many of them can be handled from the phone.

But it is not suitable for everything. Database migrations, data deletion, core service restarts, certificate changes, and major DNS changes are still actions where I want the AI to analyze first, propose a plan, and then wait for explicit confirmation before doing anything.

Remote control is not about turning servers into self-driving systems. It is about keeping the entry point available.

## My Current Structure

To summarize, this is what the structure looks like now:

<div class="ops-flow">
  <p class="ops-flow__title">Final structure: auth source, dual entries, and managed servers</p>
  <div class="ops-flow__grid ops-flow__grid--three">
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Auth source</span>
      <div class="ops-flow__name">MacBook Pro</div>
      <div class="ops-flow__desc">Handles Codex login, account switching, and auth file sync.</div>
    </div>
    <div class="ops-flow__arrow">Sync →</div>
    <div class="ops-flow__stack">
      <div class="ops-flow__node ops-flow__node--strong">
        <span class="ops-flow__kicker">Entry A</span>
        <div class="ops-flow__name">US-DMIT</div>
      </div>
      <div class="ops-flow__node ops-flow__node--strong">
        <span class="ops-flow__kicker">Entry B</span>
        <div class="ops-flow__name">US-Hetzner</div>
      </div>
    </div>
    <div class="ops-flow__arrow">SSH →</div>
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Targets</span>
      <div class="ops-flow__name">Other servers</div>
      <div class="ops-flow__desc">Maintained through the two entry servers.</div>
    </div>
  </div>
  <div class="ops-flow__grid ops-flow__grid--three" style="margin-top: 0.85rem;">
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Mobile access</span>
      <div class="ops-flow__name">Codex on phone</div>
    </div>
    <div class="ops-flow__arrow">Remote →</div>
    <div class="ops-flow__node ops-flow__node--strong">
      <span class="ops-flow__kicker">Selectable entry</span>
      <div class="ops-flow__name">US-DMIT / US-Hetzner</div>
    </div>
    <div class="ops-flow__arrow">Watchdog</div>
    <div class="ops-flow__node">
      <span class="ops-flow__kicker">Availability</span>
      <div class="ops-flow__name">Mutual checks and restarts</div>
    </div>
  </div>
</div>

The MacBook Pro is the auth source. The two U.S. servers are persistent entry points. The rest of the fleet is maintained through them. The two U.S. servers check each other so at least one entry point remains usable.

After finishing this setup, the biggest change is that server maintenance is no longer tied to one local computer.

Before, I had to get back to the MacBook Pro first, then connect to servers. Now I can open my phone and enter an operations environment that already has keys, docs, and context prepared. For someone who often switches between places and devices, that difference is very real.

If you also run a few personal servers and already use Codex or similar AI agents for operations, I think this direction is worth trying. Start with one non-core server. Do not hand over maximum permissions on day one. Once auth sync, runbooks, and Watchdog are all working smoothly, expand the scope gradually.
