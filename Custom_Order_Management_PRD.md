
# 🧾 Custom Order Management System - PRD

## 🎯 Objective
A custom order workflow where:
- Customer places order → team reviews and adds shipping charges → customer confirms final price → order is finalized and Order ID generated.

---

## 🧍‍♂️ Customer Flow (Frontend)

### Step 1: Proceed to Checkout
- When user clicks **"Proceed to Checkout"**
  - Show **Shipping Address Form** (name, phone, address, pincode, city, state).
  - On submit:
    - Send data to backend: `/api/orders/initiate`
    - Show popup:  
      ✅ `"Our team will contact you shortly with the final price."`

### Step 2: Wait for Admin Review
- Customer sees order in **"Pending Orders"** section (status: `Pending Review`).

### Step 3: Receive Shipping Charges Notification
- Once admin adds shipping charges → system sends email + in-app notification:
  ```
  Final price for your order is ₹[Product + Shipping].
  Please confirm or cancel.
  ```
- Two buttons on UI:
  - ✅ Confirm Order
  - ❌ Cancel Order

### Step 4: Confirm / Cancel
- If Confirmed:
  - `Order ID` gets generated.
  - Status changes → `Confirmed`.
  - Email sent to admin: `"Customer confirmed the final price."`
- If Cancelled:
  - Order removed from customer panel (and marked as Cancelled in admin DB).

---

## 🧑‍💼 Admin Flow (Frontend + Backend)

### Step 1: Receive New Order Notification
- On new order → Admin gets email:
  ```
  New order request received.
  Customer: [name]
  Address: [address]
  Product: [product name]
  ```
- Also visible in Admin Panel under **Pending Orders**.

### Step 2: Add Shipping Charges
- In Admin Panel → "Pending Orders" section:
  - Admin selects an order → clicks **“Add Shipping Charges”**
  - Form:
    - Shipping Cost (₹)
    - Notes (optional)
  - On submit:
    - PUT `/api/orders/add-shipping/:orderId`
    - Email triggers to Customer: “Final price ready for confirmation”

### Step 3: Finalization
- If Customer confirms → 
  - Admin dashboard shows order in **"Confirmed Orders"**
  - Order ID generated automatically (like `ORD-20251014-1234`)
- If Customer cancels →
  - Moves to **"Cancelled Orders"**
  - Not counted as valid order in analytics.

---

## ⚙️ Backend Logic (Node.js + Express + MongoDB)

### Schema: `Order`
```js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
  }],
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    pincode: String,
    city: String,
    state: String,
  },
  shippingCharges: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  orderId: { type: String },
  status: { 
    type: String, 
    enum: ['Pending Review', 'Awaiting Confirmation', 'Confirmed', 'Cancelled'], 
    default: 'Pending Review' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
```

---

### API Routes

| Route | Method | Description |
|-------|---------|-------------|
| `/api/orders/initiate` | POST | Create initial order with address and product info |
| `/api/orders/add-shipping/:id` | PUT | Admin adds shipping charges |
| `/api/orders/confirm/:id` | PUT | Customer confirms final order |
| `/api/orders/cancel/:id` | PUT | Customer cancels order |
| `/api/orders/all` | GET | Admin: fetch all orders |
| `/api/orders/my-orders` | GET | Customer: fetch user’s orders |

---

### Email Triggers
✅ On order initiation → send to admin  
✅ On admin adding shipping → send to customer  
✅ On customer confirmation → send to admin  
✅ On cancellation → send to admin

Use **Nodemailer** with your admin email (from `.env`):
```env
ADMIN_EMAIL=admin@yourdomain.com
```

---

## 💻 Frontend UI (React / Next.js)

### Customer Side
1. **Checkout Page**
   - Address form → POST `/api/orders/initiate`
   - Popup after success → `"Our team will contact shortly with final price."`
2. **Pending Orders Page**
   - Show order list with `status`.
   - If status = `Awaiting Confirmation`, show Confirm / Cancel buttons.
3. **Notifications**
   - Email + toast message on updates (using React Toastify).

### Admin Side
1. **Admin Dashboard → Pending Orders**
   - List all orders with customer + address.
   - Button “Add Shipping Charges” → form modal.
2. **Admin Dashboard → Confirmed Orders**
   - Shows finalized orders with Order IDs.
3. **Cancelled Orders Tab**
   - For tracking declined orders.

---

## 🗄️ Order Lifecycle Example

| Stage | Status | Trigger |
|--------|---------|---------|
| 1 | Pending Review | Customer initiates order |
| 2 | Awaiting Confirmation | Admin adds shipping |
| 3 | Confirmed | Customer confirms |
| 4 | Cancelled | Customer cancels before confirm |

---

## 🧩 Tech Stack
- **Frontend:**Next.js + Tailwind CSS 
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Mailing:** Nodemailer/SMTP 
- **Auth:** JWT-based (user/admin roles)

---

## ✅ Expected Output
- Fully connected order flow.
- Both admin and customer notified at every step.
- No fake order IDs unless user confirms.
- Clean separation between `Pending`, `Confirmed`, and `Cancelled` orders.
- Professional popup and email messages.
