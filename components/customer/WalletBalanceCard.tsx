'use client'

interface WalletBalanceCardProps {
  balance: number
}

function gbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

export function WalletBalanceCard({ balance }: WalletBalanceCardProps) {
  return (
    <div className="bg-[#1E1B16] rounded-2xl p-6">
      <p className="text-xs uppercase tracking-widest text-[#9C968E] mb-2">Your Balance</p>
      <p className="text-4xl font-bold text-[#C9A84C]">{gbp(balance)}</p>
      <button className="mt-4 text-xs text-[#B8962E] hover:underline">
        How to earn more →
      </button>
    </div>
  )
}
