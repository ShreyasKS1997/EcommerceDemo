import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit"
import { storeAndSetActiveAccount, switchAccount } from "../SliceThunks/userSliceThunks";
import { api } from "./api";

const middlewareListener = createListenerMiddleware();
middlewareListener.startListening({
    matcher: isAnyOf(switchAccount, storeAndSetActiveAccount),
    effect: async (action, listenerApi) => {
        listenerApi.dispatch(api.util.invalidateTags(['Cart']));
        listenerApi.dispatch(api.util.invalidateTags(['refreshUser']));
        listenerApi.dispatch(api.util.invalidateTags(['userOrders']));
    },
});

export default middlewareListener.middleware;