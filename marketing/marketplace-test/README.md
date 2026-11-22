# Facebook Marketplace test, week 1: offers

Goal: find out which offer gets more serious messages from Cobb County homeowners.
- **Listing A:** free estimate (`listing-a-free-estimate.jpg`)
- **Listing B:** storm damage help (`listing-b-storm-damage.jpg`)

Both images use the same design, towns, button and footer. Only the offer words and one small icon change,
so the test compares the offer, not the design. To make new versions (week 2 prices, week 3 cities),
add them to `VARIANTS` in `render.cjs` and run `node marketing/marketplace-test/render.cjs`.

Traction (set by Jereen): 10 or more serious messages, OR 5 people asking for an estimate. Either one is enough.

## Before you post
1. On your phone: Marketplace, then **Create new listing**. Look for a **Services** or **Home services** option.
   - If it is there, use it.
   - If you only see "Item for sale", do not post the listing there. Facebook may remove it.
     Post in local Facebook groups instead, and ask each group's admin first.
2. If Facebook asks for a price, enter **0**. Both titles say what is free.
3. Post from your own profile. No business name for now (see the name note in HANDOFF.md).

## Listing A: free estimate

**Title**
```
Tree Removal - FREE Estimates - Marietta & Cobb
```

**Description**
```
Have a tree you've been worried about? Get a FREE estimate from a local tree pro.

🌳 Tree removal and trimming
🏠 Trees over your house, roof, fence or driveway
🍂 Leaves are down, so dead limbs are easy to spot before winter storms

Serving Marietta, Smyrna, Kennesaw and Acworth.

How it works:
1. Message us your street or ZIP code and a photo of the tree
2. We connect you with one local tree pro
3. The pro contacts you to set up your free estimate

This is a free referral service. We are not the tree company. We pass your request to one local pro, who may call or text you. You never pay us anything.
```

## Listing B: storm damage

**Title**
```
Storm Damage Tree Help - Free Quote - Marietta & Cobb
```

**Description**
```
Tree down or hanging over your house after a storm? Get connected with a local tree pro.

⚡ Fallen trees and broken, hanging limbs
🏠 Trees on houses, roofs, fences, cars and driveways
📸 Send a photo so the pro knows what to bring

Serving Marietta, Smyrna, Kennesaw and Acworth.

How it works:
1. Message us your street or ZIP code and a photo of the damage
2. We connect you with one local tree pro
3. The pro contacts you to set up a free quote. Ask about same-day help.

Stay safe: keep away from downed power lines and report them to your power company. If anyone is hurt or in danger, call 911.

This is a free referral service. We are not the tree company. We pass your request to one local pro, who may call or text you. You never pay us anything.
```

## First reply (paste when someone messages)
```
Hi! Thanks for reaching out. I can connect you with a local tree pro. A few quick questions:
1. What's your street address or ZIP code?
2. What do you need? (remove, trim, or storm damage)
3. Can you send a photo of the tree?
4. How soon do you need it done?
5. Best phone number for the pro to call or text you?

Is it OK if I share these details with one local tree company so they can contact you?
```
Reply fast. Seller guides say slow replies lose people.

## How to run the test
- Days 1 to 3: post Listing A only.
- Days 4 to 6: delete A, then post Listing B only.
- Post both at about the same time of day. Change nothing else.
- Write down if a storm hits during the test. A storm makes B look better than it is.
- Winner: the listing with more serious messages.

**Serious message** = they send an address or ZIP, a photo, or a phone number.
**Asked for estimate** = they say yes to being contacted by a tree pro.

| Day | Listing | Messages | Serious | Asked for estimate | Storm? |
|---|---|---|---|---|---|
| 1 | A | | | | |
| 2 | A | | | | |
| 3 | A | | | | |
| 4 | B | | | | |
| 5 | B | | | | |
| 6 | B | | | | |

## Every lead needs a pro
Each person who says yes is waiting for a call. The same day, call a Cobb tree company and offer them the lead free,
as a trial. Pick one that gives free estimates, or change the listing wording. If no company takes it within a day,
message the homeowner honestly so they can look elsewhere.

## Rules (from CLAUDE.md)
- Always say it is a free referral service. One local pro per lead.
- No claims of licenses, insurance, reviews, years in business or jobs done.
- No other companies' photos, no before-and-after shots until a partner gives real ones with permission.
- No fake urgency (such as "only 2 spots left") and no scare prices.
