
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { useNavigate } from 'react-router-dom';

import { 
  getFamily, 
  createFamily, 
  joinFamily, 
  getInviteCode,
  regenerateInviteCode,
  getFamilyTotalSpending 
} from '../features/family/familySlice';
import { getMe } from '../features/auth/authSlice';
import { Users, UserPlus, Share2, Copy, Mail, MessageCircle, Send, Crown, Sparkles, TrendingUp, RefreshCw, X, AlertTriangle } from 'lucide-react';

const Family: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { family, isLoading, error } = useSelector((state: RootState) => state.family);
  const { user } = useSelector((state: RootState) => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [familyInviteCode, setFamilyInviteCode] = useState('');
  const [totalSpending, setTotalSpending] = useState<number | null>(null);
  const [loadingInviteCode, setLoadingInviteCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.hasFamily) {
      dispatch(getFamily());
      dispatch(getFamilyTotalSpending()).then((result: any) => {
        if (result.payload) {
          setTotalSpending(result.payload.total);
        }
      });
    }
  }, [dispatch, user]);

  const handleCreateFamily = async () => {
    if (!familyName.trim()) return;
    const result = await dispatch(createFamily(familyName));
    if (result.meta.requestStatus === 'fulfilled') {
      setShowCreateModal(false);
      setFamilyName('');
      dispatch(getMe());
      dispatch(getFamily());
      navigate('/');
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) return;
    const result = await dispatch(joinFamily(inviteCode));
    if (result.meta.requestStatus === 'fulfilled') {
      setShowJoinModal(false);
      setInviteCode('');
      dispatch(getMe());
      dispatch(getFamily());
      navigate('/');
    }
  };

  const handleShowInviteCode = async () => {
    setLoadingInviteCode(true);
    try {
      const result: any = await dispatch(getInviteCode());
      console.log('Full result:', result);
      
      if (result.payload?.inviteCode) {
        setFamilyInviteCode(result.payload.inviteCode);
        setShowShareModal(true);
      } else if (result.error) {
        alert(`Error: ${result.error.message || 'Failed to get invite code'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get invite code');
    } finally {
      setLoadingInviteCode(false);
    }
  };

  const handleRegenerateCode = async () => {
    setLoadingInviteCode(true);
    try {
      const result: any = await dispatch(regenerateInviteCode());
      if (result.payload?.inviteCode) {
        setFamilyInviteCode(result.payload.inviteCode);
        setShowRegenerateConfirm(false);
        alert('Invite code regenerated successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to regenerate code');
    } finally {
      setLoadingInviteCode(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Join our family "${family?.name}" on ExpenseTracker!\n\nInvite Code: *${familyInviteCode}*\n\nSign up at ${window.location.origin} and use this code to join!`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join our family on ExpenseTracker`);
    const body = encodeURIComponent(
      `Hi!\n\nI'd like to invite you to join our family "${family?.name}" on ExpenseTracker.\n\nUse this invite code: ${familyInviteCode}\n\nSteps to join:\n1. Sign up at ${window.location.origin}\n2. Go to the Family page\n3. Click "Join Existing Family"\n4. Enter the invite code: ${familyInviteCode}\n\nLooking forward to managing our expenses together!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(
      `Join our family "${family?.name}" on ExpenseTracker! Use invite code: ${familyInviteCode}. Sign up at ${window.location.origin}`
    );
    window.open(`sms:?body=${message}`);
  };

  const shareViaTelegram = () => {
    const message = encodeURIComponent(
      `Join our family "${family?.name}" on ExpenseTracker!\n\nInvite Code: ${familyInviteCode}\n\nSign up at ${window.location.origin} and use this code to join!`
    );
    window.open(`https://t.me/share/url?url=${window.location.origin}&text=${message}`, '_blank');
  };

  if (!user?.hasFamily) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Floating decoration */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">
                Family Expenses
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Manage your finances together
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 sm:py-4 px-6 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Create New Family
                </span>
              </button>

              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full group relative bg-white text-gray-700 py-3.5 sm:py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Join Existing Family
                </span>
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl transform animate-in zoom-in duration-200">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Family</h2>
              </div>
              <div>
                <div className="mb-5 sm:mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Family Name</label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFamily()}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-base"
                    placeholder="The Smith Family"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 px-4 rounded-xl hover:bg-gray-200 font-medium transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFamily}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-xl hover:shadow-lg font-medium transition-all disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl transform animate-in zoom-in duration-200">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Join Family</h2>
              </div>
              <div>
                <div className="mb-5 sm:mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Invite Code</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinFamily()}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-xl sm:text-2xl text-center tracking-widest transition-all"
                    placeholder="A3F7B2E1"
                    maxLength={8}
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
                    Enter the 8-character code from your family head
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 px-4 rounded-xl hover:bg-gray-200 font-medium transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinFamily}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 sm:py-3 px-4 rounded-xl hover:shadow-lg font-medium transition-all disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isLoading ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-3 sm:p-4 pb-6 sm:pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 border border-white/20">
          {isLoading && !family ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-indigo-200 border-t-indigo-600 mb-3 sm:mb-4"></div>
              <p className="text-gray-600 font-medium text-sm sm:text-base">Loading family details...</p>
            </div>
          ) : family ? (
            <>
              <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent break-words">
                      {family.name}
                    </h1>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base ml-12 sm:ml-15">Manage your family expenses together</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="relative group bg-gradient-to-br from-indigo-500 to-purple-600 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-indigo-100 font-medium text-sm sm:text-base">Total Members</h3>
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-200" />
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-white">{family.members?.length || 0}</p>
                    <p className="text-indigo-200 text-xs sm:text-sm mt-1">Active family members</p>
                  </div>
                </div>

                <div className="relative group bg-gradient-to-br from-green-500 to-emerald-600 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-green-100 font-medium text-sm sm:text-base">Total Spending</h3>
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-white">₹{totalSpending?.toFixed(2) || '0.00'}</p>
                    <p className="text-green-200 text-xs sm:text-sm mt-1">All-time expenses</p>
                  </div>
                </div>
              </div>

              {/* Invite Section */}
              {user?.role === 'head' && (
                <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-amber-300 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 opacity-20"></div>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">Invite Family Members</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      Share your unique code to let others join your family
                    </p>
                    <button
                      onClick={handleShowInviteCode}
                      disabled={loadingInviteCode}
                      className="w-full sm:w-auto group bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{loadingInviteCode ? 'Loading...' : 'Share Invite Code'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-600 text-sm sm:text-base">No family data available</p>
            </div>
          )}
        </div>

        {/* Members List */}
        {family && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              Family Members
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {family.members?.map((member: any) => (
                <div
                  key={member._id}
                  className="group flex items-center justify-between p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-indigo-200 hover:shadow-md gap-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md flex-shrink-0 ${
                      member._id === family.head 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-br from-indigo-400 to-blue-500'
                    }`}>
                      <span className="text-base sm:text-lg">{member.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base truncate">
                        <span className="truncate">{member.name}</span>
                        {member._id === family.head && <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{member.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm flex-shrink-0 ${
                      member._id === family.head
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    {member._id === family.head ? 'Head' : 'Member'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 lg:p-8 shadow-2xl transform animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Share Code</h2>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invite Code Display */}
            <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-8 rounded-xl sm:rounded-2xl mb-5 sm:mb-6 text-center overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="relative">
                <p className="text-indigo-100 mb-2 sm:mb-3 font-medium text-sm sm:text-base">Your Family Invite Code</p>
                <code className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono tracking-widest text-white drop-shadow-lg block mb-3 sm:mb-4 break-all">
                  {familyInviteCode}
                </code>
                <button
                  onClick={() => copyToClipboard(familyInviteCode)}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all hover:shadow-lg text-sm sm:text-base"
                >
                  {copied ? (
                    <>
                      <span className="text-lg sm:text-xl">✓</span>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Share via:</p>
              
              <button
                onClick={shareViaWhatsApp}
                className="w-full group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-semibold text-base sm:text-lg">WhatsApp</span>
              </button>

              <button
                onClick={shareViaEmail}
                className="w-full group flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-semibold text-lg">Email</span>
              </button>

              <button
                onClick={shareViaSMS}
                className="w-full group flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="font-semibold text-lg">Text Message</span>
              </button>

              <button
                onClick={shareViaTelegram}
                className="w-full group flex items-center gap-4 p-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <span className="font-semibold text-lg">Telegram</span>
              </button>
            </div>

            {/* Regenerate Code */}
            <div className="border-t-2 border-gray-100 pt-4">
              <button
                onClick={() => setShowRegenerateConfirm(true)}
                disabled={loadingInviteCode}
                className="w-full text-sm text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-2 py-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate Code (Old code will stop working)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Confirmation Modal */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform animate-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Regenerate Invite Code?</h3>
                <p className="text-gray-600 text-sm">
                  This will create a new invite code and invalidate the current one. Any pending invitations using the old code will no longer work.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRegenerateConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateCode}
                disabled={loadingInviteCode}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
              >
                {loadingInviteCode ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Family;