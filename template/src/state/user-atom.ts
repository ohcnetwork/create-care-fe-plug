import { atomWithStorage, createJSONStorage } from "jotai/utils";

import { UserBase } from "@/lib/types/common";

export const authUserAtom = atomWithStorage<UserBase | undefined>(
  "care-auth-user",
  undefined,
  createJSONStorage(() => sessionStorage),
);
