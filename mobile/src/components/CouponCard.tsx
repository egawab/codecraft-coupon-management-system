/**
 * Coupon Card Component
 * Mobile-specific UI for displaying coupons
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import type { Coupon } from '../../shared/types/domain.types';

interface CouponCardProps {
  coupon: Coupon;
  onPress?: (coupon: Coupon) => void;
}

export function CouponCard({ coupon, onPress }: CouponCardProps) {
  const discount = coupon.type === 'PERCENTAGE'
    ? `${coupon.discountValue}% OFF`
    : `$${coupon.discountValue} OFF`;

  const daysUntilExpiry = Math.ceil(
    (new Date(coupon.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(coupon)}
      activeOpacity={0.7}
    >
      {coupon.imageUrl && (
        <Image source={{ uri: coupon.imageUrl }} style={styles.image} />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.storeBadge}>
            {coupon.store.logo && (
              <Image
                source={{ uri: coupon.store.logo }}
                style={styles.storeLogo}
              />
            )}
            <Text style={styles.storeName} numberOfLines={1}>
              {coupon.store.name}
            </Text>
          </View>
          {coupon.isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>⭐ Featured</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {coupon.title}
        </Text>

        {coupon.description && (
          <Text style={styles.description} numberOfLines={2}>
            {coupon.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}</Text>
          </View>

          <View style={styles.expiry}>
            <Text style={[
              styles.expiryText,
              daysUntilExpiry <= 3 && styles.expiryUrgent
            ]}>
              {daysUntilExpiry <= 0 
                ? 'Expired'
                : `Expires in ${daysUntilExpiry}d`
              }
            </Text>
          </View>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Code:</Text>
          <Text style={styles.code}>{coupon.code}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  storeName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  featuredBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredText: {
    fontSize: 10,
    color: '#856404',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountBadge: {
    backgroundColor: '#0070f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expiry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 12,
    color: '#666',
  },
  expiryUrgent: {
    color: '#dc2626',
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  codeLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  code: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0070f3',
    letterSpacing: 2,
  },
});
