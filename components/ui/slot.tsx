import { Slot as RadixSlot } from '@radix-ui/react-slot';

export const Slot = RadixSlot;

export type WithAsChild<T> = T & {
  asChild?: boolean;
};
