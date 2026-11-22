// mobile/app/admin/dashboard.tsx
// Admin & Verifier Dashboard — Product moderation, community reports & user management

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { ClayButton, ClayCard, StatusBadge, ClayInput, ClayBackButton } from '@components/index';
import { Colors, Spacing, Radius, Typography, FontSize, FontWeight } from '@constants/theme';
import {
  fetchPendingApprovals,
  approveProduct,
  rejectProduct,
  requestChangesOnProduct,
  fetchAdminReports,
  resolveAdminReport,
  removeProductByAdmin,
  fetchAdminUsers,
  updateUserStatus,
} from '../../services/api';
import type { Product, CommunityReport, User } from '../../../shared/types';

type AdminTab = 'pending' | 'reports' | 'users' | 'guidelines';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const getTokenRef = React.useRef(getToken);
  getTokenRef.current = getToken;

  const [activeTab, setActiveTab] = useState<AdminTab>('pending');
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [reportsList, setReportsList] = useState<CommunityReport[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rejection modal state
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Request changes modal state
  const [changesModalVisible, setChangesModalVisible] = useState(false);
  const [changesNotes, setChangesNotes] = useState('');
  const [changesError, setChangesError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (user?.publicMetadata as any)?.role as string | undefined;
  const isAuthorized = role === 'admin' || role === 'verifier';

  const loadData = useCallback(async () => {
    if (!isAuthorized) return;
    setError(null);
    try {
      const token = await getTokenRef.current();
      if (!token) throw new Error('Not authenticated.');

      if (activeTab === 'pending') {
        const data = await fetchPendingApprovals(token);
        setPendingProducts(data);
      } else if (activeTab === 'reports') {
        const data = await fetchAdminReports(token);
        setReportsList(data);
      } else if (activeTab === 'users') {
        const data = await fetchAdminUsers(token, userSearch);
        setUsersList(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthorized, activeTab, userSearch]);

  useEffect(() => {
    if (isAuthorized) {
      setLoading(true);
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthorized, loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // Approve product
  const handleApprove = async (product: Product) => {
    Alert.alert('Approve Listing', `Publish "${product.title}" to the campus marketplace?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          setActionInProgress(product.id);
          try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated.');
            await approveProduct(token, product.id);
            Alert.alert('Approved', `"${product.title}" is now publicly visible.`);
            await loadData();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Approval failed.');
          } finally {
            setActionInProgress(null);
          }
        },
      },
    ]);
  };

  // Rejection
  const openRejectModal = (product: Product) => {
    setSelectedProduct(product);
    setRejectionReason('');
    setRejectError(null);
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedProduct) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 3) {
      setRejectError('Please provide a reason (at least 3 characters).');
      return;
    }

    setActionInProgress(selectedProduct.id);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated.');
      await rejectProduct(token, selectedProduct.id, rejectionReason.trim());
      setRejectModalVisible(false);
      setSelectedProduct(null);
      Alert.alert('Product Rejected', 'The seller will be notified with the reason provided.');
      await loadData();
    } catch (err) {
      setRejectError(err instanceof Error ? err.message : 'Rejection failed.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Request changes
  const openChangesModal = (product: Product) => {
    setSelectedProduct(product);
    setChangesNotes('');
    setChangesError(null);
    setChangesModalVisible(true);
  };

  const handleConfirmChanges = async () => {
    if (!selectedProduct) return;
    if (!changesNotes.trim() || changesNotes.trim().length < 5) {
      setChangesError('Please provide specific feedback (at least 5 characters).');
      return;
    }

    setActionInProgress(selectedProduct.id);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated.');
      await requestChangesOnProduct(token, selectedProduct.id, changesNotes.trim());
      setChangesModalVisible(false);
      setSelectedProduct(null);
      Alert.alert('Changes Requested', 'The seller was notified with your revision notes.');
      await loadData();
    } catch (err) {
      setChangesError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Reports
  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated.');
      await resolveAdminReport(token, reportId, { status });
      Alert.alert('Success', `Report marked as ${status}.`);
      await loadData();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update report.');
    }
  };

  const handleRemoveProductFromReport = async (productId: string) => {
    Alert.alert('Remove Listing', 'Permanently remove this inappropriate listing from the marketplace?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated.');
            await removeProductByAdmin(token, productId);
            Alert.alert('Listing Removed', 'The item was removed from the marketplace feed.');
            await loadData();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Removal failed.');
          }
        },
      },
    ]);
  };

  // User status
  const handleToggleUserStatus = async (userItem: User) => {
    const nextStatus = userItem.status === 'suspended' ? 'active' : 'suspended';
    const actionLabel = nextStatus === 'suspended' ? 'Suspend' : 'Restore';

    Alert.alert(
      `${actionLabel} User`,
      `Are you sure you want to mark ${userItem.fullName} (${userItem.email}) as ${nextStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: nextStatus === 'suspended' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) throw new Error('Not authenticated.');
              await updateUserStatus(token, userItem.id, nextStatus);
              Alert.alert('Updated', `User account marked as ${nextStatus}.`);
              await loadData();
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Status update failed.');
            }
          },
        },
      ],
    );
  };

  if (!isAuthorized) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ClayBackButton size={38} />
        </View>
        <ClayCard variant="peach" style={styles.blocked}>
          <Text style={styles.blockedIcon}>🚫</Text>
          <Text style={Typography.h3}>Restricted Access</Text>
          <Text style={[Typography.caption, { textAlign: 'center', marginVertical: Spacing.sm }]}>
            This portal is restricted to authorized campus moderators and administrators.
          </Text>
          <ClayButton label="Go Back" variant="secondary" onPress={() => router.back()} />
        </ClayCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ClayBackButton size={38} />
        <Text style={[Typography.h2, styles.title]}>Campus Moderation</Text>
      </View>

      {/* Segmented Navigation Tabs */}
      <View style={styles.tabs}>
        <Pressable onPress={() => setActiveTab('pending')} style={[styles.tab, activeTab === 'pending' && styles.activeTab]}>
          <Text style={[Typography.captionBold, activeTab === 'pending' ? styles.activeTabText : styles.inactiveTabText]}>
            Pending ({pendingProducts.length})
          </Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('reports')} style={[styles.tab, activeTab === 'reports' && styles.activeTab]}>
          <Text style={[Typography.captionBold, activeTab === 'reports' ? styles.activeTabText : styles.inactiveTabText]}>
            Reports ({reportsList.length})
          </Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('users')} style={[styles.tab, activeTab === 'users' && styles.activeTab]}>
          <Text style={[Typography.captionBold, activeTab === 'users' ? styles.activeTabText : styles.inactiveTabText]}>
            Users
          </Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('guidelines')} style={[styles.tab, activeTab === 'guidelines' && styles.activeTab]}>
          <Text style={[Typography.captionBold, activeTab === 'guidelines' ? styles.activeTabText : styles.inactiveTabText]}>
            Policy
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>Loading records...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {error && (
            <ClayCard variant="peach" style={{ marginBottom: Spacing.sm }}>
              <Text style={{ color: Colors.error }}>⚠️ {error}</Text>
            </ClayCard>
          )}

          {/* TAB 1: PENDING LISTINGS */}
          {activeTab === 'pending' && (
            <>
              {pendingProducts.length === 0 ? (
                <ClayCard variant="mint" style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>🎉</Text>
                  <Text style={Typography.bodyBold}>Verification Queue Clear</Text>
                  <Text style={[Typography.caption, { textAlign: 'center', marginTop: 4 }]}>
                    All student listings have been reviewed.
                  </Text>
                </ClayCard>
              ) : (
                pendingProducts.map((p) => (
                  <ClayCard key={p.id} style={styles.productCard}>
                    <View style={styles.productHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={Typography.bodyBold}>{p.title}</Text>
                        <Text style={[Typography.caption, { color: Colors.primary }]}>
                          ₹{p.price.toLocaleString('en-IN')} · {p.category.toUpperCase()} · {p.condition}
                        </Text>
                      </View>
                      <StatusBadge status={p.status} />
                    </View>

                    {p.description ? (
                      <Text style={[Typography.caption, { marginVertical: Spacing.xs }]}>{p.description}</Text>
                    ) : null}

                    {p.campusLocation ? (
                      <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                        📍 Meetup: {p.campusLocation}
                      </Text>
                    ) : null}

                    <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: Spacing.xs }]}>
                      Seller: {p.sellerName} ({p.sellerEmail || 'Campus Student'})
                    </Text>

                    <View style={styles.actionRow}>
                      <ClayButton
                        label="Approve"
                        variant="primary"
                        onPress={() => handleApprove(p)}
                        loading={actionInProgress === p.id}
                        style={{ flex: 1 }}
                      />
                      <ClayButton
                        label="Request Changes"
                        variant="secondary"
                        onPress={() => openChangesModal(p)}
                        disabled={actionInProgress === p.id}
                        style={{ flex: 1 }}
                      />
                      <ClayButton
                        label="Reject"
                        variant="ghost"
                        onPress={() => openRejectModal(p)}
                        disabled={actionInProgress === p.id}
                        textStyle={{ color: Colors.error }}
                      />
                    </View>
                  </ClayCard>
                ))
              )}
            </>
          )}

          {/* TAB 2: COMMUNITY REPORTS */}
          {activeTab === 'reports' && (
            <>
              {reportsList.length === 0 ? (
                <ClayCard variant="mint" style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>🛡️</Text>
                  <Text style={Typography.bodyBold}>No Active Reports</Text>
                  <Text style={[Typography.caption, { textAlign: 'center', marginTop: 4 }]}>
                    No community flags or scam reports currently pending.
                  </Text>
                </ClayCard>
              ) : (
                reportsList.map((rep) => (
                  <ClayCard key={rep.id} variant="peach" style={styles.productCard}>
                    <View style={styles.productHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={Typography.bodyBold}>
                          Report: {rep.targetType.toUpperCase()} ({rep.reason.toUpperCase()})
                        </Text>
                        <Text style={Typography.caption}>Target ID: {rep.targetId.slice(0, 8)}...</Text>
                      </View>
                      <StatusBadge status={rep.status === 'resolved' ? 'available' : 'pending_review'} />
                    </View>

                    {rep.details ? (
                      <Text style={[Typography.caption, { marginVertical: Spacing.xs }]}>
                        Details: {rep.details}
                      </Text>
                    ) : null}

                    <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                      Reported on: {new Date(rep.createdAt).toLocaleDateString()}
                    </Text>

                    {rep.status === 'pending' && (
                      <View style={[styles.actionRow, { marginTop: Spacing.sm }]}>
                        {rep.targetType === 'product' && (
                          <ClayButton
                            label="Remove Listing"
                            variant="secondary"
                            onPress={() => handleRemoveProductFromReport(rep.targetId)}
                            style={{ flex: 1 }}
                          />
                        )}
                        <ClayButton
                          label="Resolve"
                          variant="primary"
                          onPress={() => handleResolveReport(rep.id, 'resolved')}
                          style={{ flex: 1 }}
                        />
                        <ClayButton
                          label="Dismiss"
                          variant="ghost"
                          onPress={() => handleResolveReport(rep.id, 'dismissed')}
                        />
                      </View>
                    )}
                  </ClayCard>
                ))
              )}
            </>
          )}

          {/* TAB 3: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <>
              <ClayInput
                placeholder="Search students by name, email, or campus..."
                value={userSearch}
                onChangeText={(t) => {
                  setUserSearch(t);
                  loadData();
                }}
              />
              <View style={{ marginTop: Spacing.sm }}>
                {usersList.map((u) => (
                  <ClayCard key={u.id} style={[styles.productCard, { marginBottom: Spacing.sm }]}>
                    <View style={styles.productHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={Typography.bodyBold}>{u.fullName}</Text>
                        <Text style={Typography.caption}>{u.email}</Text>
                        <Text style={[Typography.caption, { color: Colors.primary }]}>
                          Role: {u.role.toUpperCase()} · Status: {u.status?.toUpperCase() || 'ACTIVE'}
                        </Text>
                      </View>
                      <ClayButton
                        label={u.status === 'suspended' ? 'Restore' : 'Suspend'}
                        variant={u.status === 'suspended' ? 'primary' : 'ghost'}
                        onPress={() => handleToggleUserStatus(u)}
                        textStyle={{ color: u.status === 'suspended' ? Colors.white : Colors.error }}
                      />
                    </View>
                  </ClayCard>
                ))}
              </View>
            </>
          )}

          {/* TAB 4: MODERATION POLICY */}
          {activeTab === 'guidelines' && (
            <ClayCard variant="lavender" style={{ padding: Spacing.md, gap: Spacing.sm }}>
              <Text style={Typography.h3}>Campus Moderation Guidelines</Text>
              <Text style={Typography.bodyBold}>1. Prohibited Items</Text>
              <Text style={Typography.caption}>
                Counterfeit textbooks, unauthorized exam solutions, prescription drugs, weapons, or items violating campus honor codes.
              </Text>
              <Text style={Typography.bodyBold}>2. Safe Meetup Zones</Text>
              <Text style={Typography.caption}>
                All physical exchanges must occur in certified well-lit campus zones (Library foyer, Student Center Plaza, Main Gate security post).
              </Text>
              <Text style={Typography.bodyBold}>3. Fair Pricing & Integrity</Text>
              <Text style={Typography.caption}>
                Prices must reflect fair second-hand student value in INR. Sellers may not create duplicate or speculative listings.
              </Text>
            </ClayCard>
          )}
        </ScrollView>
      )}

      {/* Rejection Modal */}
      <Modal visible={rejectModalVisible} animationType="slide" transparent onRequestClose={() => setRejectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ClayCard variant="peach" style={styles.modalCard}>
            <Text style={Typography.h3}>Reject Listing</Text>
            <Text style={[Typography.caption, { marginVertical: Spacing.xs }]}>
              Provide a clear reason for the seller:
            </Text>
            {rejectError && <Text style={{ color: Colors.error, marginBottom: Spacing.xs }}>{rejectError}</Text>}
            <ClayInput
              placeholder="e.g. Photo is blurry; please upload clear images showing textbook edition."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={3}
            />
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              <ClayButton label="Confirm Rejection" variant="primary" onPress={handleConfirmReject} style={{ flex: 1 }} />
              <ClayButton label="Cancel" variant="ghost" onPress={() => setRejectModalVisible(false)} style={{ flex: 1 }} />
            </View>
          </ClayCard>
        </View>
      </Modal>

      {/* Request Changes Modal */}
      <Modal visible={changesModalVisible} animationType="slide" transparent onRequestClose={() => setChangesModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ClayCard variant="lavender" style={styles.modalCard}>
            <Text style={Typography.h3}>Request Changes ✏️</Text>
            <Text style={[Typography.caption, { marginVertical: Spacing.xs }]}>
              Instruct the seller what needs adjustment before approval:
            </Text>
            {changesError && <Text style={{ color: Colors.error, marginBottom: Spacing.xs }}>{changesError}</Text>}
            <ClayInput
              placeholder="e.g. Please clarify book edition and mention if access code is unused."
              value={changesNotes}
              onChangeText={setChangesNotes}
              multiline
              numberOfLines={3}
            />
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              <ClayButton label="Send Request" variant="primary" onPress={handleConfirmChanges} style={{ flex: 1 }} />
              <ClayButton label="Cancel" variant="ghost" onPress={() => setChangesModalVisible(false)} style={{ flex: 1 }} />
            </View>
          </ClayCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tab: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
  },
  activeTab: { backgroundColor: Colors.primary },
  activeTabText: { color: Colors.white },
  inactiveTabText: { color: Colors.textSecondary },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxxl },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  blocked: { margin: Spacing.lg, padding: Spacing.xl, alignItems: 'center' },
  blockedIcon: { fontSize: 48, marginBottom: Spacing.sm },
  emptyCard: { padding: Spacing.xl, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  productCard: { padding: Spacing.md, marginBottom: Spacing.sm },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  actionRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(52, 41, 73, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: { width: '100%', maxWidth: 400, padding: Spacing.lg },
});
