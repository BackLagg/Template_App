import { useState, useEffect, useRef } from 'react';

interface UseAnimatedValueOptions {
    duration?: number;
    easing?: (t: number) => number;
}

const defaultEasing = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
};

export const useAnimatedValue = (
    targetValue: number,
    options: UseAnimatedValueOptions = {}
) => {
    const { duration = 1500, easing = defaultEasing } = options;
    const [animatedValue, setAnimatedValue] = useState(targetValue);
    const animationFrameRef = useRef<number | null>(null);
    const animatedValueRef = useRef(targetValue);
    const prevTargetRef = useRef(targetValue);

    useEffect(() => {
        if (targetValue === prevTargetRef.current) {
            return;
        }

        prevTargetRef.current = targetValue;

        if (targetValue === 0) {
            animatedValueRef.current = 0;
            requestAnimationFrame(() => {
                setAnimatedValue(0);
            });
            return;
        }

        const startTime = Date.now();
        const startValue = animatedValueRef.current;
        const endValue = targetValue;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);
            const currentValue = startValue + (endValue - startValue) * easedProgress;

            setAnimatedValue(currentValue);
            animatedValueRef.current = currentValue;

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [targetValue, duration, easing]);

    return animatedValue;
};

