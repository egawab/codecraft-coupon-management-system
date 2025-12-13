# 🔍 Coupon Visibility Debug - Investigation

**Date:** 2024
**Issue:** Coupons not showing for Shop Owner or in Marketplace
**Status:** 🔍 INVESTIGATING WITH DEBUG LOGS

---

## 🐛 Current Problem

**Symptoms:**
- Shop Owner creates coupon successfully
- No error messages
- BUT coupon doesn't appear in "My Coupons"
- Coupon doesn't appear in Marketplace
- This was working before

---

## 🔍 Investigation Steps Taken

### 1. Verified Firestore Rules ✅
```javascript
match /coupons/{couponId} {
  allow read: if true; // Coupons are public - CORRECT
  allow create: if isAuthenticated() && 
                   request.resource.data.shopOwnerId == request.auth.uid;
}
```
**Status:** Rules are correct and allow reading coupons

### 2. Verified Query Logic ✅
```typescript
getCouponsForShop: async (shopOwnerId: string) => {
    const q = query(
        collection(db, "coupons"), 
        where("shopOwnerId", "==", shopOwnerId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
}
```
**Status:** Query logic is correct

### 3. Verified Data Flow ✅
```
User creates coupon
  → api.createCoupon()
  → Transaction completes
  → 500ms delay for propagation
  → onCouponCreated() callback
  → fetchData() is called
  → api.getCouponsForShop(user.id)
  → setCoupons() updates state
  → UI should re-render
```
**Status:** Flow looks correct

---

## 🔧 Debug Logging Added

### In api.ts - getCouponsForShop()
```typescript
getCouponsForShop: async (shopOwnerId: string) => {
    logger.debug(`🔍 Fetching coupons for shop owner: ${shopOwnerId}`);
    const q = query(collection(db, "coupons"), where("shopOwnerId", "==", shopOwnerId));
    const querySnapshot = await getDocs(q);
    const coupons = querySnapshot.docs.map(fromFirestore);
    logger.debug(`✅ Found ${coupons.length} coupons for shop owner ${shopOwnerId}`);
    
    if (coupons.length > 0) {
        logger.debug(`📝 Sample coupon:`, coupons[0]);
    }
    
    return coupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
```

### In ShopOwnerDashboard.tsx - fetchData()
```typescript
const fetchData = useCallback(async () => {
    logger.debug(`🔄 fetchData called for user: ${user.id}`);
    // ... fetch data ...
    logger.debug(`✅ Data fetched successfully:`, {
        coupons: shopCoupons.length,
        referrals: shopReferrals.length,
        redemptions: redemptions.length,
        customers: customers.length
    });
    
    setCoupons(shopCoupons);
    // ... set other state ...
    
    logger.debug('✅ Shop Owner Dashboard Data loaded and state updated', {
        couponsInState: shopCoupons.length
    });
}, [user, safeAsync]);
```

---

## 🚀 Deployment

**Status:** ✅ DEPLOYED

Now the console will show:
1. When fetchData is called
2. What user ID is being used
3. How many coupons are found
4. Sample coupon data
5. When state is updated

---

## 📋 Testing Instructions

### Step 1: Clear Everything
1. Clear browser cache completely (Ctrl+Shift+Delete)
2. Select "All time"
3. Check "Cookies" and "Cached images and files"
4. Clear data

### Step 2: Open Console
1. Press F12 to open Developer Tools
2. Go to "Console" tab
3. Clear the console (trash icon or Ctrl+L)

### Step 3: Login and Test
1. Login as Shop Owner
2. **Watch the console** - you should see:
   ```
   🔄 fetchData called for user: [your-user-id]
   📡 Fetching all shop owner data...
   🔍 Fetching coupons for shop owner: [your-user-id]
   ✅ Found X coupons for shop owner [your-user-id]
   📝 Sample coupon: {...}
   ✅ Data fetched successfully: { coupons: X, ... }
   ✅ Shop Owner Dashboard Data loaded and state updated: { couponsInState: X }
   ```

### Step 4: Create a New Coupon
1. Fill out the create coupon form
2. Submit the form
3. **Watch the console** - you should see:
   ```
   🔄 fetchData called for user: [your-user-id]
   (... fetching logs ...)
   ✅ Found X+1 coupons (if successful)
   ```

### Step 5: Report Findings
**Please share the console output so we can see:**
- How many coupons are found?
- What does a sample coupon look like?
- Is fetchData being called?
- Are there any errors in the console?

---

## 🔍 Possible Issues to Check

### Issue 1: User ID Mismatch
**Symptoms:** Query finds 0 coupons
**Cause:** The user.id used in query doesn't match shopOwnerId in coupon
**Check:** Compare user ID in console with shopOwnerId in Firebase Console

### Issue 2: Coupons Not Actually Created
**Symptoms:** Console shows "Found 0 coupons"
**Cause:** Transaction failing silently
**Check:** Look in Firebase Console → Firestore → coupons collection

### Issue 3: State Not Updating
**Symptoms:** Console shows coupons found, but UI doesn't show them
**Cause:** React state update issue
**Check:** Console should show "couponsInState: X" matching fetched count

### Issue 4: Component Not Re-rendering
**Symptoms:** State updated but UI still shows old data
**Cause:** React not detecting state change
**Check:** Look for component warnings in console

### Issue 5: Firestore Cache Issue
**Symptoms:** Old data showing instead of new
**Cause:** Firestore client cache not invalidated
**Check:** Try in incognito mode

---

## 🎯 Next Steps

Based on console output, we'll determine:

**If coupons are found (count > 0):**
- Issue is with React state or rendering
- Need to check component lifecycle

**If coupons are NOT found (count = 0):**
- Issue is with Firestore query or data
- Need to check Firebase Console directly
- Verify shopOwnerId matches user.id

**If fetchData is not called:**
- Issue is with callback or event flow
- Need to check onCouponCreated connection

---

## 📞 Action Required

Please:
1. Deploy has been completed
2. Clear your cache completely
3. Open console (F12)
4. Login as Shop Owner
5. **Share screenshot of console output**
6. Try creating a coupon
7. **Share screenshot of console output after creation**

This will tell us exactly where the issue is.

---

*Debug deployment: 2024*
*Status: DEPLOYED WITH LOGGING*
*Waiting for test results...*
