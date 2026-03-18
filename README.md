# 🌿 Sanjeevani — Herb Supply Chain Tracker v2.0

A complete QR-based supply chain tracking system for medicinal herbs.  
**Farmer → Transporter → Lab → Manufacturer → Consumer**

---

## 🏗 Project Structure

```
project/
├── backend/          ← Node.js + Express + MongoDB
└── frontend/         ← React + Vite + Tailwind CSS
```

---

## ⚙️ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env → set MONGO_URI and JWT_SECRET
npm run dev
```

### Environment Variables (`.env`)
```
MONGO_URI=mongodb://localhost:27017/sanjeevani
JWT_SECRET=your_super_secret_key_change_in_production
PORT=5000
```

### API Routes

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/signin` | Public | Login |
| GET | `/api/auth/me` | Any | Get current user |
| POST | `/api/herbs` | Farmer | Upload crop |
| PATCH | `/api/herbs/:id/qr` | Farmer | Save QR to herb |
| GET | `/api/herbs/my` | Farmer | Get only THIS farmer's crops |
| GET | `/api/herbs/area` | Transporter | Get pending crops in my pincode |
| GET | `/api/herbs/:id` | Public | Get herb by ID (for QR scan) |
| POST | `/api/transport` | Transporter | Create transport record |
| GET | `/api/transport/my` | Transporter | My transport jobs |
| GET | `/api/transport/area` | Lab | Transported batches in my area |
| GET | `/api/transport/:id` | Public | Get transport by ID |
| POST | `/api/lab` | Lab | Create lab test record |
| GET | `/api/lab/my` | Lab | My lab records |
| GET | `/api/lab/area` | Manufacturer | Lab-verified batches |
| GET | `/api/lab/:id` | Public | Get lab record by ID |
| POST | `/api/manufacture` | Manufacturer | Create manufacture record |
| GET | `/api/manufacture/my` | Manufacturer | My products |
| GET | `/api/manufacture/consumer/:id` | Public | Full chain for consumer |
| GET | `/api/government/stats` | Government | Live dashboard stats |
| GET | `/api/government/users` | Government | All users (paginated) |

---

## 🖥 Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env
npm run dev
```

### Environment Variables (`.env`)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:5173
```

---

## 👥 Roles & Flows

### 🌿 Farmer
1. Sign up / Sign in
2. Go to **Upload Crop** — GPS auto-detects location
3. Fill herb name + quantity → submit
4. A unique QR is generated and saved
5. View all **My Crops** with chain status

### 🚚 Transporter
1. Sign up with **same pincode** as farmers in your area
2. Go to **Transport Jobs** — see pending farmer crops in your pincode
3. Click **Pick Up** OR **Scan Farmer QR**
4. Fill driver name, vehicle number, transport quantity
5. Submit → a new **Lab QR** is generated

### 🔬 Lab
1. Sign up as Lab with your pincode
2. Go to **Lab Testing** → click **Scan Transport QR**
3. Scan the QR from transporter
4. Fill test parameters (moisture, purity, pesticide, active compound)
5. Select certificates and quality result
6. Submit → a new **Manufacturer QR** is generated

### 🏭 Manufacturer
1. Sign up as Manufacturer
2. Go to **Manufacturing** → click **Scan Lab QR**
3. Scan the QR from lab
4. Fill company, product name, batch number, expiry, processes
5. Submit → a **Consumer QR** is generated

### 👤 Consumer
- Scan the final QR on the product
- See the complete journey: Farmer → Transport → Lab → Manufacture

### 🏛️ Government
- View live stats: count of all roles, crops, quality rates
- Charts: farmers by state, crop types, monthly registrations
- India density map showing all users by state
- Searchable/filterable user list

---

## 🔑 Key Fixes Made (vs Original)

| Issue | Fix |
|-------|-----|
| OCR-gated signup | Normal phone + password form |
| Plaintext passwords | bcrypt hashing |
| No JWT auth | Full JWT implementation |
| All farmers' data shown on one dashboard | `farmer: req.user._id` filter — each farmer sees only their own crops |
| Schema defined twice in `server.js` | Removed inline schema, use model files only |
| `processSchema.js` syntax error | Fixed — field nesting was broken |
| Dashboard route using undefined variables | Replaced with proper model queries |
| No location-based filtering for transporter/lab | `pincode: user.pincode` filter on area queries |
| No government dashboard | Full stats endpoint + charts + map |
| Docker/blockchain dependency | Removed — pure MongoDB |
| Missing role: `government` | Added to User enum and routes |

---

## 🗂 Models Overview

```
User        → name, phone, password(hashed), role, pincode, state, city
Herb        → farmer(ref), herbName, quantity, geoLocation, status, qrImage
Transport   → herb(ref), farmer(ref), transporter(ref), driverName, vehicleNumber, qrImage
Lab         → herb(ref), transport(ref), labUser(ref), qualityAssurance, rating, certificates, qrImage
Manufacture → herb(ref), transport(ref), lab(ref), manufacturer(ref), productName, qrImage
```

Each model links back through the chain via ObjectId refs, so the consumer view can `.populate()` all 4 stages in one query.
