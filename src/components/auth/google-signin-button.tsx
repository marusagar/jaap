'use client';

import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GoogleIcon } from '../icons';
import { Loader2 } from 'lucide-react';
import { initializeNewUser } from '@/lib/firestore';

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const handleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Check if the user is new
      if(result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
        await initializeNewUser(db, result.user);
      }
      router.push('/app');
    } catch (error: any) {
      // Don't show an error toast if the user simply closes the popup.
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Error',
          description: error.message || 'Could not sign in with Google.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon className="mr-2 h-4 w-4" />
      )}
      Google
    </Button>
  );
}
