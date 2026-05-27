import { useEffect, useState } from "react"

export const useDebounce = (value, delay = 500) => {

    const [debounceValue, setDebounceValue] = useState();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounceValue(value);
        }, delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounceValue;
}