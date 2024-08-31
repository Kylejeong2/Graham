// For auth with stripe and stuff

import { auth, currentUser } from "@clerk/nextjs/server";

export const getAuthSession = async () => {
  const session = auth();
  const user = await currentUser();
  
  if (!session || !user) {
    return null;
  }

  return {
    ...session,
    user: {
      ...user,
      email: user.emailAddresses[0]?.emailAddress,
    },
  };
};