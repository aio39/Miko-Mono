import { showChatToRoom, toastLog, updateUserScore } from '@src/helper';
import { setMotionToAvatar } from '@src/helper/dynamic/setMotionToAvatar';
import { useBeforeunload } from '@src/hooks';
import { useMyPeer, useSocket } from '@src/hooks/dynamicHooks';
import {
  currentAvatarState,
  currentPenlightState,
  curUserTicketState,
  enterRoomIdAsyncState,
  latestScoreState,
  myStreamState,
  mySyncDataConnectionState,
  peerDataListState,
  PickUserData,
} from '@src/state/recoil';
import { useUser } from '@src/state/swr';
import { DataConnectionEvent } from '@src/types/dto/DataConnectionEventType';
import produce from 'immer';
import { useRouter } from 'next/router';
import { DataConnection, MediaConnection } from 'peerjs';
import { FC, ReactElement, useCallback, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { PeerDataInterface } from '../../types/local';

type PeerFatalErrorType = 'browser-incompatible' | 'invalid-id' | 'invalid-key' | 'ssl-unavailable' | 'server-error' | 'socket-error' | 'socket-closed';

type PeerNotFatalType = 'disconnected' | 'network' | 'peer-unavailable' | 'unavailable-id' | 'webrtc';

// type PeerErrorType = PeerFatalErrorType | PeerNotFatalType;

const WithSocketEventLayout: FC<{ children: ReactElement }> = ({ children }) => {
  const socket = useSocket();
  const myPeer = useMyPeer();

  // const syncDataConnectionRef = useRef<DataConnection>();
  const setMySyncDataConnection = useSetRecoilState(mySyncDataConnectionState);

  const { data: userData } = useUser();
  const myPeerUniqueID = userData?.uuid;

  const myStream = useRecoilValue(myStreamState);
  const roomId = useRecoilValue(enterRoomIdAsyncState);
  const userTicket = useRecoilValue(curUserTicketState);
  const { concertId, ticketId, id: userTicketId } = userTicket;

  const setLatestScoreState = useSetRecoilState(latestScoreState);
  const setPeerDataList = useSetRecoilState(peerDataListState);
  const setCurrentAvatar = useSetRecoilState(currentAvatarState);
  const setPenlightAvatar = useSetRecoilState(currentPenlightState);

  const router = useRouter();

  const handleLeavePage = () => {
    console.log('withSocketPeerLayer - handleLeavePage');
    setPeerDataList([]);
  };

  useBeforeunload(() => {
    console.log('windowBeforeUnloadEvent in WithSocketPeerLayer');
    handleLeavePage();
  });

  const addDataConnectionToPeersDataList = useCallback((dataConnection: DataConnection) => {
    setPeerDataList(
      produce(draft => {
        const idx = draft.findIndex(peer => peer.id === dataConnection.peer);
        if (idx >= 0) draft[idx].dataConnection = dataConnection;
      }),
    );
  }, []);

  const addMediaStreamToPeersDataList = useCallback((mediaStream: MediaStream, id: string) => {
    setPeerDataList(
      produce(draft => {
        const idx = draft.findIndex(peer => peer.id === id);
        if (idx >= 0) draft[idx].mediaStream = mediaStream;
      }),
    );
  }, []);

  const addMediaConnectionToPeersDataList = useCallback((mediaConnection: MediaConnection, id: string) => {
    setPeerDataList(
      produce(draft => {
        const idx = draft.findIndex(peer => peer.id === id);
        if (idx >= 0) draft[idx].mediaConnection = mediaConnection;
      }),
    );
  }, []);

  const removePeerById = useCallback((id: string) => {
    setPeerDataList(
      produce(draft => {
        const idx = draft.findIndex(peer => peer.id === id);
        if (idx !== -1) {
          toastLog('info', `${draft[idx].data.name}??????????????????????????????`);
          draft.splice(idx, 1);
        }
      }),
    );
  }, []);

  useEffect(() => {
    if (!socket || !userData || !myPeer) {
      toastLog('error', 'socket, userData, myPeer ??? ????????? ????????????');
      console.log('socket || user ??????', socket, myPeer, userData);
      return;
    }
    console.log('WithSocketPeerLayer  UseEffect');
    socket.emit('fe-new-user-request-join', myPeerUniqueID, roomId, userData, concertId, ticketId, userTicketId);
    socket.on('connect', () => {
      // NOTE ?????? ??????????????? ?????? ?????? ???????????? ??????, ?????? ????????? ???????????? ?????? connect ????????? ???????????? ???????????? ??????.
      if (socket.connected) {
        socket.emit('fe-new-user-request-join', myPeerUniqueID, roomId, userData, concertId, ticketId, userTicketId);
      }
    });

    const addEventToDataConnection = (dataConnection: DataConnection) => {
      const id = dataConnection.peer;
      dataConnection.on('data', (event: DataConnectionEvent) => {
        switch (event.type) {
          case 'chat':
            showChatToRoom(id, event.data.text, 5);
            break;
          case 'motion':
            setMotionToAvatar(id, event.data);
            break;
          case 'scoreUpdate':
            updateUserScore(id, event.data);
            break;
          case 'avatarChange':
            setCurrentAvatar(
              produce(draft => {
                draft[event.data.sender] = event.data.index;
              }),
            );
            break;
          case 'penlightChange':
            setPenlightAvatar(
              produce(draft => {
                draft[event.data.sender] = event.data.color; // color === number, index
              }),
            );
            break;
          default:
            break;
        }
      });
      // Firefox??? ?????? ??????.
      dataConnection.on('close', () => {
        // mediaConnection.close() ??? or ????????? ??? ?????? ,
        toastLog('info', `${(dataConnection.metadata as PickUserData).name}?????????????????????????????????????????????????????????`, 'dataConnection on close');
        removePeerById(id);
      });

      dataConnection.on('error', err => {
        console.error('dataConnection error', err);
        // switch (err.type) {
        //   case '':
        //     break;

        //   default:
        //     break;
        // }

        // toastLog('error', `${(dataConnection.metadata as PickUserData).name}?????????????????????????????????????????????????????????`, 'dataConnection on error', err);
        // removePeerById(id);
      });
    };

    const addEventToMediaConnection = (mediaConnection: MediaConnection) => {
      mediaConnection.on('stream', remoteStream => {
        addMediaStreamToPeersDataList(remoteStream, mediaConnection.peer);
      });
    };

    const peerOnDataConnection = (dataConnection: DataConnection): void => {
      if (dataConnection.metadata?.type === 'sync') {
        setMySyncDataConnection(dataConnection);
      } else {
        addDataConnectionToPeersDataList(dataConnection);
        addEventToDataConnection(dataConnection);
      }
    };
    myPeer.on('connection', peerOnDataConnection);

    //  TODO ????????? ?????????
    const peerOnCall = (mediaConnection: MediaConnection): void => {
      addMediaConnectionToPeersDataList(mediaConnection, mediaConnection.peer);
      addEventToMediaConnection(mediaConnection);
      mediaConnection.answer(myStream);

      mediaConnection.on('close', () => {
        // ?????? ????????? close ?????????
        console.log('mediaConnection close');
      });

      mediaConnection.on('error', err => {
        console.error('mediaConnection error', err);
      });
    };
    myPeer.on('call', peerOnCall);

    myPeer.on('error', err => {
      console.log('myPeer error', err);
    });

    const newUserCome = (otherPeerId: string, roomID: string, otherUserData: PeerDataInterface['data'], otherSocketId: string) => {
      toastLog('info', `${otherUserData.name}????????????????????????????????????`);
      const peerIdDuplicateWithMe = otherPeerId === myPeerUniqueID;
      if (peerIdDuplicateWithMe) {
        toastLog('warning', `${otherUserData.name}???PeerId???${otherPeerId}?????????????????????`);
        return;
      }

      setPeerDataList(
        produce(prevPeers => {
          const notFound = !prevPeers.some(peer => peer.id === otherPeerId);
          if (notFound) prevPeers.push({ id: otherPeerId, data: otherUserData });
          return prevPeers;
        }),
      );

      socket.emit('fe-answer-send-peer-id', otherSocketId);
      const mediaConnection = myPeer.call(otherPeerId, myStream);
      addMediaConnectionToPeersDataList(mediaConnection, mediaConnection.peer);
      addEventToMediaConnection(mediaConnection);

      const dataConnection = myPeer.connect(otherPeerId, { metadata: otherUserData });
      dataConnection.on('open', () => {
        addDataConnectionToPeersDataList(dataConnection);
        addEventToDataConnection(dataConnection);
      });
    };

    // TODO ?????? ????????????, ????????? ??????
    const getAnswerFromRoomBroadcast = (peerId: string, otherUserData: PeerDataInterface['data']) => {
      setPeerDataList(
        produce(prevPeers => {
          const notFound = !prevPeers.some(peer => peer.id === peerId);
          if (notFound && peerId !== myPeerUniqueID)
            prevPeers.push({
              id: peerId,
              data: otherUserData,
            });
          return prevPeers;
        }),
      );
    };

    const failEnterRoom = () => {
      // TODO ????????? ??? ????????? ?????? ??????.
      toastLog('info', '?????????????????????????????????????????????????????????????????????????????????');
    };

    const userLeft = (peerId: string) => {
      removePeerById(peerId);
    };

    const getMyScore = (score: number) => {
      setLatestScoreState(
        produce(draft => {
          draft[userData.uuid] = score;
        }),
      );
    };

    const shouldOutFromRoom = () => {
      toastLog('info', 'concert ended', '????????? ????????????.');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    };

    socket.on('be-new-user-come', newUserCome);
    socket.on('be-broadcast-peer-id', getAnswerFromRoomBroadcast);
    socket.on('be-fail-enter-room', failEnterRoom);
    socket.on('be-user-left', userLeft);
    socket.on('be-send-user-score', getMyScore);
    socket.on('be-go-out-room', shouldOutFromRoom);

    return () => {
      console.log('withSocketPeerLayer - useEffect ?????????');
      if (userData) {
        socket.off('be-new-user-come', newUserCome);
        socket.off('be-broadcast-peer-id', getAnswerFromRoomBroadcast);
        socket.off('be-user-left', userLeft);
        socket.off('be-send-user-score', getMyScore);
        socket.off('be-go-out-room', shouldOutFromRoom);

        myPeer.off('connection', peerOnDataConnection);
        myPeer.off('call', peerOnCall);
        handleLeavePage();
      }
    };
    //  ????????? ?????? ?????? userData??? ?????????. userData??? ???????????? ????????? ????????? ????????? ????????? ?????? ??????
  }, [socket, myPeer]);

  return <> {children}</>;
};

export default WithSocketEventLayout;
