# 👨‍💼 Create Admin Account - Step-by-Step Guide

## Creating Admin Account for: osamakhalil740@gmail.com

---

## 📋 **Prerequisites**

- Firebase Console access
- Project: effortless-coupon-management
- Email: osamakhalil740@gmail.com

---

## ✅ **Method 1: Through Firebase Console (Recommended)**

### **Step 1: Create Authentication Account**

1. **Go to Firebase Console:**  
   https://console.firebase.google.com/project/effortless-coupon-management/authentication/users

2. **Click "Add User" button** (top right)

3. **Enter Details:**
   - **Email:** `osamakhalil740@gmail.com`
   - **Password:** Create a strong password (e.g., `Admin@2024Secure!`)
   - Click **"Add User"**

4. **Copy the User UID** that appears (you'll need this!)
   - It looks like: `xYz123AbC456...` (28 characters)
   - **SAVE THIS UID!**

---

### **Step 2: Create User Document in Firestore**

1. **Go to Firestore Database:**  
   https://console.firebase.google.com/project/effortless-coupon-management/firestore

2. **Navigate to `users` collection** (or create it if it doesn't exist)

3. **Click "Add Document"**

4. **Set Document ID:**
   - **Use the User UID you copied** from Step 1
   - Example: `xYz123AbC456...`

5. **Add Fields:** (Click "Add field" for each)

   | Field Name | Type | Value |
   |------------|------|-------|
   | `email` | string | `osamakhalil740@gmail.com` |
   | `displayName` | string | `Osama Khalil` |
   | `role` | string | `admin` |
   | `isActive` | boolean | `true` |
   | `createdAt` | timestamp | [Click "Current timestamp"] |
   | `phoneNumber` | string | (optional - your phone) |

6. **Click "Save"**

---

### **Step 3: Verify the Account**

1. **Check Authentication:**  
   - Go to: https://console.firebase.google.com/project/effortless-coupon-management/authentication/users
   - Verify you see: osamakhalil740@gmail.com

2. **Check Firestore:**  
   - Go to: https://console.firebase.google.com/project/effortless-coupon-management/firestore
   - Open `users` collection
   - Find document with your UID
   - Verify `role: "admin"` is set

---

### **Step 4: Login and Test**

1. **Go to website:**  
   https://effortless-coupon-management.web.app

2. **Click "Login"**

3. **Enter credentials:**
   - Email: `osamakhalil740@gmail.com`
   - Password: (the password you set)

4. **Navigate to Admin Dashboard**

5. **Click "User Management" tab**

6. **Test admin actions** (delete, deactivate, etc.)

---

## ✅ **Method 2: Using Firebase Admin SDK Script**

If you prefer automation, use this script:

### **Create File: `scripts/createAdmin.ts`**

```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (you need service account key)
const serviceAccount = require('../service-account-key.json');

initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

async function createAdmin() {
  const email = 'osamakhalil740@gmail.com';
  const password = 'Admin@2024Secure!'; // Change this!
  
  try {
    // Create authentication user
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: 'Osama Khalil',
      emailVerified: true
    });

    console.log('✅ Auth user created with UID:', userRecord.uid);

    // Create Firestore document
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      displayName: 'Osama Khalil',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      phoneNumber: '' // Add your phone if needed
    });

    console.log('✅ Firestore document created');
    console.log('\n🎉 Admin account created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🆔 UID:', userRecord.uid);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

createAdmin();
```

**Note:** This requires a service account key (download from Firebase Console → Project Settings → Service Accounts)

---

## 🔍 **Verification Steps**

After creating the admin account, verify:

### **1. Check Firebase Authentication**

```
✅ Go to: Authentication → Users
✅ Find: osamakhalil740@gmail.com
✅ Status: Enabled
✅ UID: [Copy this]
```

### **2. Check Firestore Document**

```
✅ Go to: Firestore Database → users collection
✅ Find document: [Your UID]
✅ Verify fields:
   - email: "osamakhalil740@gmail.com"
   - role: "admin"
   - isActive: true
```

### **3. Test Login**

```
✅ Visit: https://effortless-coupon-management.web.app
✅ Login with: osamakhalil740@gmail.com
✅ Check: Can access Admin Dashboard
✅ Test: Can view User Management
✅ Test: Can perform admin actions
```

---

## 🎯 **Required Firestore Document Structure**

Your admin user document MUST have this exact structure:

```json
{
  "email": "osamakhalil740@gmail.com",
  "displayName": "Osama Khalil",
  "role": "admin",
  "isActive": true,
  "createdAt": {
    "_seconds": 1702468800,
    "_nanoseconds": 0
  },
  "phoneNumber": "+1234567890"
}
```

**Critical Fields:**
- ✅ `role: "admin"` (lowercase, EXACTLY this)
- ✅ `isActive: true` (boolean)
- ✅ `email` matches authentication email

---

## 🔒 **Security Rules Reference**

The Firestore rules check for admin like this:

```javascript
function isAdmin() {
  return isAuthenticated() && 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

**For this to work:**
1. User must be authenticated (logged in)
2. User document must exist in `users/{uid}`
3. Document must have `role: "admin"`

---

## 📝 **Quick Reference Card**

| Step | Action | Location |
|------|--------|----------|
| 1 | Create Auth User | Firebase Console → Authentication → Add User |
| 2 | Copy UID | Authentication page (after creating user) |
| 3 | Create Firestore Doc | Firestore → users → Add Document |
| 4 | Set Document ID | Use the UID from step 2 |
| 5 | Add Fields | email, displayName, role, isActive, createdAt |
| 6 | Set role | **"admin"** (lowercase) |
| 7 | Login | Website login page |
| 8 | Test | Admin Dashboard → User Management |

---

## ⚠️ **Common Mistakes to Avoid**

### ❌ **Wrong:**
```json
{ "role": "Admin" }           // Capital A
{ "role": "ADMIN" }           // All caps
{ "role": "administrator" }   // Different word
{ "role": "super-admin" }     // Wrong term
```

### ✅ **Correct:**
```json
{ "role": "admin" }  // Lowercase "admin"
```

### ❌ **Wrong Collection:**
- Creating in `shops` collection
- Creating in `admins` collection
- Creating in `authentication` (auth is separate)

### ✅ **Correct Collection:**
- `users` collection (exactly this name)

### ❌ **Wrong Document ID:**
- Using email as document ID
- Using random ID
- Not matching Auth UID

### ✅ **Correct Document ID:**
- **Must be the Auth UID** from Step 1

---

## 🌍 **For Both Development & Production**

The same steps work for both environments. Just make sure:

### **Development (Local):**
- Use `.env.local` with dev Firebase config
- Create admin in dev Firebase project

### **Production:**
- Use `.env.production` with prod Firebase config
- Create admin in **effortless-coupon-management** project (which we're using)

**Current Project:** effortless-coupon-management (Production)

---

## 🆘 **Troubleshooting**

### **Issue: Can't find users collection**

**Solution:** Create it manually
1. Go to Firestore
2. Click "Start collection"
3. Collection ID: `users`
4. Add first document (your admin)

### **Issue: Permission denied when creating**

**Solution:** You need Firebase project Owner/Editor role
- Go to: https://console.firebase.google.com/project/effortless-coupon-management/settings/iam
- Verify you have Owner or Editor role

### **Issue: Admin actions still not working**

**Solution:** 
1. Verify `role: "admin"` is set (lowercase)
2. Logout and login again
3. Clear browser cache
4. Check console for other errors

---

## 📞 **Support Links**

- **Firebase Console:** https://console.firebase.google.com
- **Authentication Users:** https://console.firebase.google.com/project/effortless-coupon-management/authentication/users
- **Firestore Database:** https://console.firebase.google.com/project/effortless-coupon-management/firestore
- **Live Website:** https://effortless-coupon-management.web.app

---

## ✅ **Summary Checklist**

- [ ] Created auth user with email: osamakhalil740@gmail.com
- [ ] Copied the User UID
- [ ] Created document in `users` collection
- [ ] Document ID matches Auth UID
- [ ] Set `role: "admin"` (lowercase)
- [ ] Set `isActive: true`
- [ ] Set email and displayName
- [ ] Tested login on website
- [ ] Accessed Admin Dashboard
- [ ] Tested User Management tab
- [ ] Verified admin actions work

---

**Once you complete these steps, the admin account will have full permissions to manage all users, coupons, and accounts!**

🎉 **You'll be ready to use the Admin User Management panel!**
