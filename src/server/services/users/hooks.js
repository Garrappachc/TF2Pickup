import merge from 'lodash.merge';
import SteamCommunity from 'steamcommunity';
import debug from 'debug';

import getUserData from './third-party-services';

const community = new SteamCommunity();
const log = debug('TF2Pickup:users:hooks');

export default {
  before: {
    async create(props) {
      const userData = await getUserData(props.data.id, true, props.app);

      return {
        ...props,
        data: merge({}, props.data, userData, { createdAt: new Date() }),
      };
    },
  },

  after: {
    async create(props) {
      const logs = props.app.service('logs');

      log('Created a new user', props.data.id);

      await logs.create({
        message: 'Created a new user',
        environment: 'server',
        steamId: props.data.id,
      });

      await new Promise((resolve) => {
        community.inviteUserToGroup(props.data.id, '103582791435021680', () => {
          resolve();
        });
      });

      return props;
    },
  },
};
