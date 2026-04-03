# Hyde End — Off-shelf platforms & token registry design

Operational Q&A: choosing a platform for tokenisation, transfers, and sales, and a simple registry structure. Complements [HYDE_END_FOUNDERS_ALLOCATION.md](HYDE_END_FOUNDERS_ALLOCATION.md) (narrative) and [OASIS_WINE_SYNDICATE_PLATFORM.md](OASIS_WINE_SYNDICATE_PLATFORM.md) (OASIS / holon / passport integration).

---

## Q1. What platform could I use off the shelf to manage tokenisation of the vineyard and the transfer and sale of tokens going forward?

This is a really important decision—and honestly, most people get it wrong by going too “crypto” or too “institutional”.

You actually have **three viable routes**, depending on how simple vs sophisticated you want this to be.

### What you actually need (use case)

Your token is **not**:

- A financial security (ideally)
- Equity
- A complex DeFi product

It is closer to:

**A transferable membership / allocation right with economic value.**

So your platform needs to handle:

- Issue tokens (or digital rights)
- Track ownership
- Allow transfer / resale
- Possibly a light marketplace
- Simple UX

### Three realistic approaches

#### Option 1 — Web2 + light tokenisation (recommended start)

- Airtable / Notion registry
- Stripe payments
- Manual transfer approval
- Optional NFT layer later

#### Option 2 — Semi-professional platforms

- Securitize
- Tokeny
- Polymath

*(Useful but often overkill and too “financial”.)*

#### Option 3 — Web3 platforms

- thirdweb
- Manifold
- OpenSea

*(Good long-term but more friction.)*

### Recommendation

**Start simple** with a private registry and controlled transfers. Add sophistication later if demand exists.

---

## Q2. Please design a simple but elegant token registry system

### Core structure

Each token is a **named entry** in a master register, e.g. `HYDE-001`, `HYDE-002`, etc.

Each token represents:

- **12 bottles per year**
- **20% discount**
- **Transferable with approval**

### System components

#### 1. Master Token Register

| Field | Purpose |
|-------|---------|
| Token ID | Unique identifier (e.g. HYDE-001) |
| Status | Active, transferred, suspended, etc. |
| Holder name | Current holder |
| Contact details | Email / phone |
| Issue date and price | When issued and at what price |
| Transfer date | Last transfer (if any) |
| Entitlement | Bottles / terms summary |
| Discount | e.g. 20% |
| Notes | Free text |
| Signed terms | Reference or link |
| Payment received | Yes / amount / date |

#### 2. Holder Register

| Field | Purpose |
|-------|---------|
| Name, contact details | Identity |
| Tokens held | List or count of token IDs |
| Acquisition history | How they obtained each |
| Preferences | Comms, delivery, etc. |

#### 3. Annual Allocation Ledger

| Field | Purpose |
|-------|---------|
| Vintage year | e.g. 2026 |
| Token ID | Which right |
| Holder | Who for that vintage |
| Pricing | Amount charged |
| Allocation status | Ordered, paid, fulfilled, etc. |
| Payment and fulfilment | Dates / refs |

#### 4. Transfer Log

| Field | Purpose |
|-------|---------|
| Transfer reference | Unique ref |
| Token ID | Which token moved |
| Seller / buyer | Parties |
| Price | If applicable |
| Dates | Request, approval, completion |
| Approval status | Pending / approved / rejected |

### Best tools (practical stack)

- **Airtable** (recommended for the registers)
- **DocuSign** (terms)
- **Stripe** / **Xero** (payments / accounting)
- **Email workflows** (notifications)

### Issuance process

1. Buyer confirms  
2. Payment received  
3. Token assigned  
4. Terms signed  
5. Registry updated  
6. Certificate issued  

### Transfer process

1. Request submitted  
2. Form signed  
3. Registry updated  
4. New holder confirmed  

### Resale approach

- **Private matching list** (buyers / sellers)
- **No formal exchange** initially

### Key rules

- **Register is source of truth**
- Tokens **transferable but controlled**
- **12 bottles per year** per token
- **Use-it-or-lose-it** (recommended **60-day window** for annual allocation)
- **No fractional tokens**

### Positioning (language)

**Prefer:**

- Founders Register  
- Allocation Register  

**Avoid:**

- Heavy “crypto” language in customer-facing copy  

### Conclusion

Start simple, maintain control, and scale sophistication only when demand proves itself.
