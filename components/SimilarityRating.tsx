'use client'

import { CheckIcon } from '@/components/ui/icons/check'

export function SimilarityRating({ similarity }) {
  let activeIcons = 0

  if (similarity < 0.8) {
    activeIcons = 1
  } else if (similarity >= 0.8 && similarity < 0.84) {
    activeIcons = 2
  } else if (similarity >= 0.84) {
    activeIcons = 3
  }

  return (
    <div className="flex">
      {[...Array(3)].map((_, index) => (
        <span key={'sim' + index} className={index < activeIcons ? '' : 'opacity-20'}>
          <CheckIcon key={index} />
        </span>
      ))}
    </div>
  )
}
