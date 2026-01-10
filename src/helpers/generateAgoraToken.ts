import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export function generateAgoraToken({
  channelName,
  uid,
  role,
}: {
  channelName: string;
  uid: number;
  role: 'PUBLISHER' | 'SUBSCRIBER';
}) {
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTimestamp + expirationTimeInSeconds;

  return RtcTokenBuilder.buildTokenWithUid(
    process.env.AGORA_APP_ID!,
    process.env.AGORA_APP_CERT!,
    channelName,
    uid,
    role === 'PUBLISHER' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
    privilegeExpireTime,
  );
}
