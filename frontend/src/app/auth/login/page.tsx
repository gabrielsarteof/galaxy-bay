"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ethers, Eip1193Provider } from 'ethers';
import Image from 'next/image';

import { useRequestNonceMutation, useLoginMutation } from '@/hooks/useAuthMutations';
import Button from '@/components/Button';

export default function LoginPage() {
  const [address, setAddress] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const {
    mutate: requestNonceMutate,
    isPending: isRequesting,
  } = useRequestNonceMutation();
  
  const {
    mutate: loginMutate,
    isPending: isLoggingIn,
  } = useLoginMutation();

  const handleRequestNonce = async () => {
    const ethereum = (window as {ethereum?: Eip1193Provider}).ethereum;
    if (!ethereum) {
      alert('Instale o MetaMask');
      return;
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const [acct] = accounts;
      setAddress(acct);
      requestNonceMutate(acct, {
        onSuccess: (nonce) => setMessage(nonce),
        onError: () => alert('Erro ao solicitar nonce'),
      });
    } catch {
      alert('Erro ao conectar MetaMask');
    }
  };

  const handleLogin = async () => {
    const ethereum = (window as {ethereum?: Eip1193Provider}).ethereum;
    if (!ethereum) {
      alert('Instale o MetaMask');
      return;
    }
    if (!message) {
      alert('Nonce não recebido');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      loginMutate(
        { address, signature },
        {
          onSuccess: (data) => {
            if (data && data.accessToken) {
              localStorage.setItem('accessToken', data.accessToken);
              localStorage.setItem('walletAddress', address);
              router.replace('/');
            } else {
              console.error("Token não encontrado na resposta:", data);
            }
          },
          onError: () => alert('Erro ao fazer login'),
        }
      );
    } catch {
      alert('Erro ao assinar mensagem');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-4">
        <Image
          src="/logo.png"
          alt="Galaxy Bay Logo"
          width={80}
          height={80}
        />
        <div className="flex flex-col leading-tight font-poppins">
          <span className="text-4xl font-semibold text-gray-900">Galaxy</span>
          <span className="text-4xl font-light text-gray-900">Bay</span>
        </div>
      </div>

      {/* Card de Login */}
      <div className="w-full max-w-md px-8">
        <h1 className="text-center text-xl font-bold mb-5 text-gray-900 tracking-tight">
          Conecte-se à sua conta
        </h1>

        {/* Botão MetaMask */}
        {!address && (
          <button
            onClick={handleRequestNonce}
            disabled={isRequesting}
            className="w-full flex items-center justify-center gap-3 py-3.5 mb-6 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-gray-900"
          >
            {isRequesting ? (
              <svg
                className="animate-spin h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            ) : (
              <Image
                src="/MetaMask-icon-fox.svg"
                alt="MetaMask"
                width={24}
                height={24}
              />
            )}
            <span>
              {isRequesting ? 'Conectando...' : 'Continuar com o MetaMask'}
            </span>
          </button>
        )}

        {/* Estado conectado */}
        {address && !isRequesting && (
          <div className="space-y-6">
            <div className="text-center py-4 px-6 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600">
                Conectado como{' '}
                <span className="font-mono font-semibold text-gray-900">
                  {address.slice(0, 6)}…{address.slice(-4)}
                </span>
              </p>
            </div>

            <Button
              onClick={handleLogin}
              loading={isLoggingIn}
              disabled={!message}
              fullWidth
            >
              Assinar e entrar
            </Button>

            <button
              onClick={() => {
                setAddress('');
                setMessage('');
              }}
              className="w-full text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Conectar com outra carteira
            </button>
          </div>
        )}

        {/* Separador "ou" - apenas quando não conectado */}
        {!address && (
          <>
            <div className="flex items-center mb-6">
              <hr className="flex-grow border-t border-gray-200" />
              <span className="px-4 text-sm font-medium text-gray-500">ou</span>
              <hr className="flex-grow border-t border-gray-200" />
            </div>

            <p className="text-center text-sm font-medium text-gray-600">
              <a href="/help" className="underline hover:text-gray-900 transition-colors">
                Precisa de ajuda para entrar na sua conta?
              </a>
            </p>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="fixed bottom-6 text-center text-xs font-medium text-gray-500 px-4 max-w-2xl leading-relaxed">
        Ao se cadastrar, você está criando uma conta do Galaxy Bay<br />
        e concorda com os{' '}
        <a href="/terms" className="underline hover:text-gray-900 transition-colors">
          Termos
        </a>{' '}
        e a{' '}
        <a href="/privacy" className="underline hover:text-gray-900 transition-colors">
          Política de Privacidade
        </a>{' '}
        do Galaxy Bay
      </p>
    </div>
  );
}