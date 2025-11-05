'use client';

import { useState } from 'react';
import { useOffers } from '@/hooks/useOffers';
import { useMetaMask } from '@/hooks/useMetaMask';

interface OffersPanelProps {
  nftId: string;
  nftPrice?: number | null;
  ownerId?: string;
}

export function OffersPanel({ nftId, nftPrice, ownerId }: OffersPanelProps) {
  const { address } = useMetaMask();
  const { offers, isLoading, createOffer, isCreating, acceptOffer, isAccepting, cancelOffer } = useOffers(nftId);
  const [offerAmount, setOfferAmount] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);

  const isOwner = address?.toLowerCase() === ownerId?.toLowerCase();

  const handleCreateOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      alert('Insira um valor válido');
      return;
    }

    try {
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 7);

      await createOffer({
        nftId,
        amount: parseFloat(offerAmount),
        expiration: expiration.toISOString(),
      });

      setOfferAmount('');
      setShowOfferForm(false);
      alert('Oferta criada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar oferta:', error);
      alert(error?.message || 'Falha ao criar oferta');
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    const confirmed = window.confirm('Aceitar esta oferta?');
    if (!confirmed) return;

    try {
      await acceptOffer({ offerId });
      alert('Oferta aceita com sucesso!');
    } catch (error: any) {
      console.error('Erro ao aceitar oferta:', error);
      alert(error?.message || 'Falha ao aceitar oferta');
    }
  };

  const handleCancelOffer = async (offerId: string) => {
    const confirmed = window.confirm('Cancelar esta oferta?');
    if (!confirmed) return;

    try {
      await cancelOffer(offerId);
      alert('Oferta cancelada!');
    } catch (error: any) {
      console.error('Erro ao cancelar oferta:', error);
      alert(error?.message || 'Falha ao cancelar oferta');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Ofertas</h3>
        {!isOwner && (
          <button
            onClick={() => setShowOfferForm(!showOfferForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold"
          >
            Fazer Oferta
          </button>
        )}
      </div>

      {showOfferForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium mb-2">Valor da Oferta (ETH)</label>
          <input
            type="number"
            step="0.001"
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            placeholder="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
          />
          {nftPrice && (
            <p className="text-sm text-gray-600 mb-2">
              Preço listado: {nftPrice} ETH
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleCreateOffer}
              disabled={isCreating}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {isCreating ? 'Criando...' : 'Criar Oferta'}
            </button>
            <button
              onClick={() => setShowOfferForm(false)}
              className="flex-1 bg-gray-300 py-2 rounded-md hover:bg-gray-400 font-semibold"
            >
              Cancelar
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ofertas expiram em 7 dias
          </p>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500 text-sm">Carregando ofertas...</p>
        ) : offers.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma oferta ainda</p>
        ) : (
          offers.map((offer: any) => (
            <div key={offer.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-lg">{offer.amount} ETH</p>
                  <p className="text-xs text-gray-600">
                    De: {offer.bidderAddress.slice(0, 6)}...{offer.bidderAddress.slice(-4)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expira: {new Date(offer.expiration).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  {offer.status === 'active' && (
                    <>
                      {isOwner && (
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={isAccepting}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                        >
                          Aceitar
                        </button>
                      )}
                      {address?.toLowerCase() === offer.bidderAddress.toLowerCase() && (
                        <button
                          onClick={() => handleCancelOffer(offer.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      )}
                    </>
                  )}
                  {offer.status !== 'active' && (
                    <span className="text-xs text-gray-500 uppercase">{offer.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
