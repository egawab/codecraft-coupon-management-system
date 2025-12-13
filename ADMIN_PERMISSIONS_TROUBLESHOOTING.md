# 🔧 Admin Permissions Troubleshooting Guide

## Issue: "Missing or insufficient permissions" Error

The Admin user is getting permission denied errors when trying to delete coupons or manage users.

---

## ✅ Solution Steps

### **Step 1: Verify Admin User Role in Firestore**

The admin user MUST have `role: 'admin'` in the Firestore `users` collection.

**Check in Firebase Console:**

1. Go to: https://console.firebase.google.com/project/effortless-coupon-management/firestore
2. Navigate to: **Firestore Database** → **users** collection
3. Find your admin user document (search by your email)
4. Check the `role` field

**It should show:**
```
role: "admin"
```

**If it shows something else (like "super-admin", "shop_owner", etc.), UPDATE it to "admin"**

---

### **Step 2: Update Admin User Role (If Needed)**

#### **Option A: Through Firebase Console (Easiest)**

1. Open Firestore Database
2. Go to `users` collection
3. Click on your user document
4. Find the `role` field
5. Change the value to: **admin** (lowercase)
6. Click **Save**

#### **Option B: Through Firestore Rules Playground**

1. Go to Firestore Database
2. Click on **Rules** tab
3. Click **Simulator/Playground**
4. Set document path: `users/{your-user-id}`
5. Update the role field

---

### **Step 3: Verify Firestore Rules Are Active**

Check that the new rules are deployed:

1. Go to: https://console.firebase.google.com/project/effortless-coupon-management/firestore/rules
2. Verify the rules show the `isAdmin()` function:

```javascript
function isAdmin() {
  return isAuthenticated() && 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

3. Check the published date - should be recent (today)

---

### **Step 4: Get Your User ID**

You need to know your Firebase Auth User ID to check the Firestore document.

**Method 1: From Browser Console**
1. Login to the site
2. Open browser console (F12)
3. Type: `firebase.auth().currentUser.uid`
4. Copy the UID

**Method 2: From Firebase Console**
1. Go to: https://console.firebase.google.com/project/effortless-coupon-management/authentication/users
2. Find your email
3. Copy the **User UID**

---

### **Step 5: Create Admin User Document (If Missing)**

If your user document doesn't exist in the `users` collection:

1. Go to Firestore Database
2. Open `users` collection
3. Click **Add Document**
4. Document ID: **[Your Firebase Auth UID]**
5. Add fields:
   ```
   email: "your-email@example.com"
   displayName: "Your Name"
   role: "admin"
   createdAt: [Current Timestamp]
   isActive: true
   ```
6. Click **Save**

---

### **Step 6: Logout and Login Again**

After updating the role:
1. **Logout** from the website
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Login again**
4. **Try the admin actions** again

---

## 🔍 **Verification Checklist**

Use this checklist to verify everything is set up correctly:

- [ ] Admin user exists in **Authentication** (with your email)
- [ ] Admin user document exists in **users** collection
- [ ] User document ID matches Firebase Auth UID
- [ ] `role` field is set to **"admin"** (lowercase, no quotes in value)
- [ ] Firestore rules are deployed with `isAdmin()` function
- [ ] Rules published date is recent (today)
- [ ] Logged out and logged back in after role change

---

## 🧪 **Test Admin Permissions**

After setting up correctly, test these:

1. **Login** to the website
2. Go to **Admin Dashboard**
3. Click **User Management** tab
4. Try to:
   - View all users (should work)
   - Click on a user (should show details)
   - Try to delete a coupon (should work)
   - Try to deactivate a user (should work)

Check browser console - should show **no permission errors**.

---

## 🔒 **Security Rules Explained**

### **What the Rules Check:**

When admin tries to delete a coupon, Firestore checks:

1. ✅ Is user authenticated?
2. ✅ Does user document exist in `users` collection?
3. ✅ Does user document have `role: 'admin'`?
4. ✅ If all true → Allow action

### **Why It Might Fail:**

- ❌ User document doesn't exist in `users` collection
- ❌ User document exists but `role` is NOT "admin"
- ❌ User document ID doesn't match Auth UID
- ❌ Rules not deployed yet
- ❌ User not logged out/in after role change

---

## 📋 **Quick Fix Command (Manual)**

If you have access to Firebase Admin SDK or Firestore console:

**Set your user as admin:**

1. Open Firestore console
2. Navigate to `users` collection
3. Find or create document with your Auth UID
4. Set these fields:
   ```json
   {
     "email": "your-email@example.com",
     "displayName": "Your Name",
     "role": "admin",
     "isActive": true,
     "createdAt": [timestamp]
   }
   ```

---

## 🆘 **Still Not Working?**

### **Check These:**

1. **Firestore Rules Tab:**
   - Are rules published?
   - Does it show the `isAdmin()` function?
   
2. **Browser Console:**
   - Any other errors besides permission?
   - Check Network tab for 403 errors

3. **Firestore Console:**
   - Does your user document exist?
   - Is the role field EXACTLY "admin" (lowercase)?

4. **Authentication:**
   - Are you logged in with the correct account?
   - Does your auth UID match the user document ID?

---

## 💡 **Common Mistakes**

### ❌ **Wrong role value:**
```json
{ "role": "Admin" }  // Wrong - capital A
{ "role": "ADMIN" }  // Wrong - all caps
{ "role": "administrator" }  // Wrong - different word
```

### ✅ **Correct role value:**
```json
{ "role": "admin" }  // Correct - lowercase "admin"
```

### ❌ **User document in wrong collection:**
- Document in `shops` collection → Wrong
- Document in `admins` collection → Wrong

### ✅ **Correct location:**
- Document in `users` collection → Correct

---

## 🔐 **Firestore Rules Reference**

The deployed rules allow admin to:

```javascript
// Users collection
match /users/{userId} {
  allow delete: if isAdmin();  // Admin can delete any user
}

// Coupons collection
match /coupons/{couponId} {
  allow delete: if isAuthenticated() && 
                   (resource.data.shopOwnerId == request.auth.uid || isAdmin());
  // Admin can delete any coupon
}
```

---

## 📞 **Next Steps**

1. ✅ **Verify** your user role in Firestore
2. ✅ **Update** role to "admin" if needed
3. ✅ **Logout** and login again
4. ✅ **Test** admin actions
5. ✅ **Check** console for errors

If still not working after following these steps, there may be a caching issue with Firestore rules (can take a few minutes to propagate).

---

**Most Common Solution:** Your user document in the `users` collection needs to have `role: "admin"` set.

Check this first in Firebase Console → Firestore Database → users collection!
