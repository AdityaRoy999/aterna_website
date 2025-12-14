import { useInView, type UseInViewOptions } from 'framer-motion';
import { useRef } from 'react';

export interface UseIsInViewProps extends UseInViewOptions {
  inView?: boolean;
  inViewOnce?: boolean;
  inViewMargin?: UseInViewOptions['margin'];
}

export function useIsInView(
  ref: React.RefObject<HTMLElement | null>,
  { inView = true, inViewOnce = false, inViewMargin, ...options }: UseIsInViewProps = {}
) {
  const internalRef = useRef<HTMLElement>(null);
  const targetRef = ref || internalRef;
  
  const isInViewResult = useInView(targetRef, {
    once: inViewOnce,
    margin: inViewMargin,
    ...options
  });

  return {
    ref: targetRef,
    isInView: inView ? isInViewResult : false,
  };
}
