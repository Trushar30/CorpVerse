import client from './client';

export const getLeaderboard = (params) => client.get('/leaderboard', { params });
export const getMyRank = () => client.get('/leaderboard/my-rank');
export const getMyBadges = () => client.get('/leaderboard/badges');

export default {
  getLeaderboard,
  getMyRank,
  getMyBadges,
};
