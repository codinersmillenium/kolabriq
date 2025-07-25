// components/TopUpModal.tsx
import { cn } from '@/lib/utils'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Wallet } from 'lucide-react'
import { useState } from 'react'

export const TopUpModal = ({open, setOpen}: any) => {
  const [amount, setAmount] = useState('')

  const handleTopUp = () => {
    console.log('Top up amount:', amount)
    alert('Redirect in payment method...')
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Content className="bg-white dark:bg-[#1e1e1e] text-black dark:text-white rounded-2xl p-6 w-full max-w-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 shadow-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Wallet size={24} />
              <Dialog.Title className="text-xl font-semibold">Top Up</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="hover:opacity-80">
                <X size={22} />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium">Enter Amount (in Rupiah)</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <button
              onClick={handleTopUp}
              disabled={!amount || Number(amount) <= 0}
              className={cn(
                "mt-4 py-3 rounded-lg font-semibold transition",
                amount && Number(amount) > 0
                  ? "bg-black hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              Confirm Top Up
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}