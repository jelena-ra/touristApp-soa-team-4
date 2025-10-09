/**
 * Utility function for merging CSS classes
 * Angular equivalent of clsx + tailwind-merge
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .filter((cls, index, arr) => {
      // Basic deduplication - could be enhanced with proper tailwind merging logic
      return cls && arr.indexOf(cls) === index;
    })
    .join(' ');
}

/**
 * Conditional class helper
 */
export function conditionalClass(condition: boolean, trueClass: string, falseClass?: string): string {
  return condition ? trueClass : falseClass || '';
}