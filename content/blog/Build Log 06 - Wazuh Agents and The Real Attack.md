# Build Log 06: Wazuh Agents and The Real Attack

## The Goal

Everything I'd caught so far, the vsftpd exploit and the VLAN-crossing traffic underneath it, I'd caught at the network layer. pfSense sees packets crossing a firewall boundary. It has no idea what's actually happening on the machine those packets land on: what process ran, what account logged in, what a domain controller's own Security log has to say about a Kerberos ticket request. Host-based agents close that gap, and this entry is really two halves of one story: getting those agents live, then using them for the real attack this whole build was pointed at from the start.

Every Metasploitable walkthrough on the internet ends the same way, a known backdoor and instant root, and I already ran that back in [Build Log 04](/blog/build-log-04) as a deliberate, known-good test signal, not a demonstration of attacker skill. This is the one I actually wanted to get to: a real attack against the Active Directory environment from [Build Log 05](/blog/build-log-05), the kind of technique real internal pentests and red teams use against real companies, not a lab toy. Specifically, Kerberoasting, requesting a Kerberos service ticket for an account with a Service Principal Name registered, then taking that ticket off-box to crack offline.

---

## Getting the Agents Live

I already had a working pattern for reaching machines on the internal network: SSH straight in, using the Proxmox host as a jump box. Tried it against Kali and it just hung, no error, nothing. [Before assuming anything was broken, I checked both directions independently instead of guessing](/errors#err-attack-vlan-inbound-blocked). SSH was genuinely running on Kali, and outbound traffic off the ATTACK VLAN worked fine. The actual cause: the ATTACK VLAN's pfSense pass rule, built specifically to let Kali's exploit traffic reach Metasploitable, only ever permitted that one direction. Nothing had opened the reverse path for management traffic initiating a connection in. Not worth widening that VLAN's exposure just for convenience, so I did the rest of this one through the Proxmox console instead.

Wazuh's dashboard has its own guided install path, Endpoint Management, Deploy new agent, which generates a version-matched install command instead of making you guess at URLs. That command still has to be retyped by hand into a console, since noVNC's clipboard has burned me before, and [retyping it character by character produced a handful of small single-character typos across both installs](/errors#err-wazuh-agent-retyped-console-commands). None of the error messages pointed at "you mistyped a character," each looked like a real, unrelated problem until I compared the retyped line against the wizard's original output side by side. Both agents went in clean on the corrected retries, confirmed **Active** in Wazuh's Endpoint Management dashboard.

That status check was the bar I set for "done" at the time. I didn't go further and check which specific events were actually easy to find. What I didn't know yet was that "the agent is Active" and "the specific event I care about is easy to find" turn out to be two different questions, and the gap between them is exactly what the rest of this session spent most of its time finding out the hard way.

---

## Setting Up a Target

Kerberoasting needs something to Kerberoast, an account with an SPN registered so there's a service ticket worth requesting. A fresh domain with nothing but `Administrator` and the DC's own machine account doesn't have one. I created `svc-sql`, a plain domain user meant to simulate a service account, the kind every real AD environment has a dozen of, usually over-privileged and forgotten about, and registered an SPN for it. Confirming it with `setspn -Q */*` showed it sitting right there next to the DC's own built-in SPNs. A real target, ready to go.

---

## Running the Attack

Impacket ships on Kali as apt packages now, not the `.py` scripts every older walkthrough references. The actual command is `impacket-GetUserSPNs`. First real run came back with an authentication error despite correct credentials. [The password itself was fine, bash wasn't passing it through unmangled](/errors#err-bash-history-expansion-password). It has a `!` in it, and an unquoted `!` on the command line triggers bash's history expansion before Impacket ever sees the string. Single-quoting the whole credential argument fixed it outright.

With that fixed, the real run went clean and returned a proper Kerberos ticket hash, `$krb5tgs$23$...`. That `$23$` is the actual signature of the attack, not just formatting: it's etype 23, RC4. A properly hardened AD environment would only hand out AES tickets. Getting RC4 back means the ticket is crackable offline with commodity hardware, no domain access needed beyond this one request. That hash, on its own, is the attack succeeding.

---

## Where Wazuh Should Have Caught It

The second half of the plan was simple on paper: find the matching Windows event in Wazuh, confirm it logged the RC4 ticket request, and either find an existing alert rule or write one. What actually happened took most of a session.

First mistake: [I searched the wrong field](/errors#err-wazuh-4769-targetusername-vs-servicename). The field that sounds like it should hold the account under attack actually holds the account that *requested* the ticket, `Administrator` in this case. The account actually being ticketed lives in a completely different field, `serviceName`. Once I had the right field, the real problem showed up: nothing. Not a syntax error, an honest gap in the raw event stream, timestamps jumping straight past the entire window the attack ran in.

I tried the obvious fix. [Windows' Advanced Audit Policy has a specific subcategory](/errors#err-auditpol-trailing-space) governing whether these events get written at all, and enabling it explicitly seemed like the answer, except my first attempt at that command failed on a trailing space inside the quotes that I couldn't even see. Fixed the typo, confirmed the policy applied clean, restarted the Wazuh agent, and ran the whole attack again. Still nothing.

Before accepting that as a dead end, I wanted independent proof the attack had actually reached the DC at all. pfSense caught the entire exploit chain back in Build Log 04 without missing a beat, and its firewall log, filtered to the attack window, showed exactly what I expected: clean passed connections from Kali to `winserver`, hitting both the LDAP lookup and the actual Kerberos ticket requests. The precise network fingerprint of the attack, logged cleanly, independent of anything happening on the Wazuh side. Good, the attack was real and reached its target. That still left the actual question unanswered.

---

## Isolating the Real Cause

Rather than accept "Wazuh just doesn't catch this," I worked through the pipeline one layer at a time. Windows' own Security log, checked directly and bypassing Wazuh entirely, had the ticket requests sitting right there, so auditing was never the problem. Wazuh keeps two separate indices, one that only holds rule-matched events and one that holds everything forwarded regardless of rule matching, and every search up to that point had only checked the first one. Switching to the full archive and re-running the same filter still came back empty, ruling out "the ruleset just doesn't have a rule for this" too. The agent's own configuration file, checked directly, wasn't filtering the event out either.

Three layers deep and still nothing explained it. Then I found the actual issue almost by accident: [the dashboard's index pattern had never had its field list manually refreshed, so the field I was filtering on wasn't even registered as searchable yet](/errors#err-wazuh-stale-index-pattern-field-cache). It simply didn't show up in the picker. Refreshing it, then re-running the attack one more time with the agent stable and well past any recent restart, produced four clean hits immediately.

I can't cleanly separate which of two things actually mattered: a stale field cache silently turning real matches into false "0 hits," or the agent's live event subscription missing events fired in a tight burst too close to a restart. Possibly both contributed. What I do have, concretely, is a repeatable fix and a confirmed, reproducible result.

---

## The Actual Finding

I went into this expecting to end it with a custom Wazuh detection rule, alert didn't fire, write the rule, done. What I got instead was a longer and more honest debugging story: a default Wazuh install that looked broken for an entire session turned out to be working correctly the whole time, once I'd ruled out every other explanation instead of stopping at the first dead end.

The attack is proven three independent ways: the crackable RC4 hash from Impacket, pfSense's firewall log catching the exact network fingerprint, and Wazuh's own archived event once the dashboard's field cache and the agent's restart timing stopped getting in the way. That's the whole chain, attacker to target to detection, verified end to end, mistakes documented rather than edited out. The custom-rule work is still worth doing, since Wazuh's default ruleset genuinely has no purpose-built rule watching for an RC4 ticket request against a non-krbtgt account, even though the raw event is there to build one from. A real next project, not a loose end left over from this one not working.
