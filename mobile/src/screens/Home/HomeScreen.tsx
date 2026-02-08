/**
 * Home Screen
 * Shows featured coupons and deals
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { CouponService } from '../../../shared/core/coupons/coupon.service';
import { createApiClient } from '../../../shared/api/client';
import { getAuthTokens } from '../../../shared/stores/auth.store';
import { CouponCard } from '../../components/CouponCard';
import type { Coupon } from '../../../shared/types/domain.types';

const apiClient = createApiClient({
  baseURL: 'https://api.kobonz.com',
  getAuthTokens,
});

const couponService = new CouponService(apiClient);

export function HomeScreen() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCoupons = async () => {
    try {
      const featured = await couponService.getFeatured(20);
      setCoupons(featured);
    } catch (error) {
      console.error('Load coupons error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCoupons();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0070f3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={coupons}
        renderItem={({ item }) => <CouponCard coupon={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No coupons available</Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Featured Deals</Text>
            <Text style={styles.headerSubtitle}>
              Discover amazing discounts near you
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
