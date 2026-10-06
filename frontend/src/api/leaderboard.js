import client from './client';

export const getLeaderboard = (params) => client.get('/leaderboard', { params });
export const getMyRank = () => client.get('/leaderboard/my-rank');
export const getMyBadges = () => client.get('/leaderboard/badges');
export const getWealthLeaderboard = (params) => client.get('/leaderboard/wealth', { params });
export const getCompanyLeaderboard = (params) => client.get('/leaderboard/companies', { params });

export default {
  getLeaderboard,
  getMyRank,
  getMyBadges,
  getWealthLeaderboard,
  getCompanyLeaderboard,
};

