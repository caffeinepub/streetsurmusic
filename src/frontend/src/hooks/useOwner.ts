const OWNER_KEY = "streetsurmusic_owner_principal";

export function useOwner(currentPrincipal?: string) {
  const storedOwner = localStorage.getItem(OWNER_KEY);
  const isOwner = !!storedOwner && storedOwner === currentPrincipal;
  const hasOwner = !!storedOwner;

  const claimOwnership = (principal: string) => {
    localStorage.setItem(OWNER_KEY, principal);
    window.location.reload();
  };

  return { isOwner, hasOwner, claimOwnership };
}
