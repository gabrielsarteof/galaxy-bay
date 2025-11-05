import { useMutation } from '@tanstack/react-query';
import { requestNonce, login } from '@/services/api';


export function useRequestNonceMutation() {
  return useMutation<string, Error, string>({
    mutationFn: (address: string) =>
      requestNonce(address).then((res) => res.nonce),
  });
}

export function useLoginMutation() {
  return useMutation<{ accessToken: string }, Error, { address: string; signature: string }>({
    mutationFn: ({ address, signature }: { address: string; signature: string }) =>
      login(address, signature),
  });
}
