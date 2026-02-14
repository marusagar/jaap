'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Loader2, Target } from 'lucide-react';
import {
  addHistoryEntry,
  updateUserCounter,
  updateUserTarget,
} from '@/lib/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserCounter as nonBlockingUpdate } from '@/lib/firestore';
import confetti from 'canvas-confetti';
import { isBefore, startOfToday } from 'date-fns';

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export function CounterClient() {
  const { user } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => (user ? doc(db, 'users', user.uid) : undefined), [user, db]);
  const { data: userData, isLoading: userLoading } = useDoc<UserData>(userDocRef);

  const [localCount, setLocalCount] = useState(0);
  const [newTarget, setNewTarget] = useState(108);
  const { toast } = useToast();

  useEffect(() => {
    if (userData) {
        setLocalCount(userData.counter);
        setNewTarget(userData.target);
    }
  }, [userData]);

  useEffect(() => {
    if (user && userData && userData.lastUpdated && db) {
      const lastUpdatedDate = userData.lastUpdated.toDate();
      const today = startOfToday();

      if (isBefore(lastUpdatedDate, today) && userData.counter > 0) {
        addHistoryEntry(db, user.uid, userData.counter)
          .then(() => {
            updateUserCounter(db, user.uid, 0);
            setLocalCount(0);
            toast({
              title: "New Day, New Start!",
              description: `Progress from yesterday (${userData.counter}) saved to history.`,
            });
          })
          .catch((error) => {
            console.error("Failed to perform daily reset:", error);
            toast({
              variant: "destructive",
              title: "Reset Failed",
              description: "Could not save yesterday's progress.",
            });
          });
      }
    }
  }, [userData, user, db, toast]);


  const debouncedUpdate = useMemo(
    () =>
      debounce((userId: string, count: number) => {
        nonBlockingUpdate(db, userId, count);
      }, 500),
    [db]
  );


  const handleIncrement = () => {
    const newCount = localCount + 1;
    setLocalCount(newCount);
    if (user) {
      debouncedUpdate(user.uid, newCount);
    }

    if (userData && userData.target > 0 && newCount === userData.target) {
      toast({
        title: "🎉 Congratulations!",
        description: `You've reached your target of ${userData.target}!`,
      });
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        zIndex: 1000,
      });
    }

    if (userData?.settings.vibration) {
      try {
        if (typeof window.navigator.vibrate === 'function') {
          window.navigator.vibrate(50);
        }
      } catch (e) {
        console.warn('Vibration not supported');
      }
    }
    if (userData?.settings.sound) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        console.warn('Sound not supported');
      }
    }
  };

  const handleReset = async () => {
    if (user && localCount > 0 && db) {
      await addHistoryEntry(db, user.uid, localCount);
      await updateUserCounter(db, user.uid, 0);
      setLocalCount(0);
      toast({ title: 'Progress Saved', description: `Your session of ${localCount} has been saved to history.` });
    } else if (localCount === 0) {
      toast({ title: 'No Progress to Save', description: 'Your counter is already at 0.' });
    }
  };

  const handleTargetUpdate = async () => {
    if (user && newTarget > 0 && db) {
      await updateUserTarget(db, user.uid, newTarget);
      toast({ title: 'Target Updated', description: `Your new target is ${newTarget}.` });
    }
  };

  const progress =
    userData && userData.target > 0
      ? (localCount / userData.target) * 100
      : 0;

  if (userLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center bg-card rounded-lg shadow-sm">
      <div className="relative w-full max-w-xs sm:max-w-sm mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Reset and Save</span>
          </Button>
          <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">
            Target: {userData?.target ?? 0}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                <Target className="h-4 w-4" />
                <span className="sr-only">Set Target</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Set Your Target</DialogTitle>
                <DialogDescription>Set a new goal for your practice. Common targets are 108 or 1008.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="target" className="text-right">
                    Target
                  </Label>
                  <Input
                    id="target"
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(parseInt(e.target.value, 10))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit" onClick={handleTargetUpdate}>
                    Save Target
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <h1
          className="text-7xl sm:text-9xl font-bold text-primary my-2 select-none"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {localCount}
        </h1>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex items-center justify-center gap-6 w-full max-w-md my-8">
        <Button
          size="icon"
          className="h-40 w-40 rounded-full shadow-lg active:scale-95 transition-transform bg-primary hover:bg-primary/90"
          onClick={handleIncrement}
          aria-label="Increment count"
        >
          <span className="text-5xl font-bold">JAAP</span>
        </Button>
      </div>
    </div>
  );
}
