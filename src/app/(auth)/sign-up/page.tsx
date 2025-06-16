'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import debounce from 'lodash.debounce';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SignUpInput, signUpSchema } from '@/schemas/signUpSchema';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SignUpPage() {
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Debounced username availability check
  const checkUsernameAvailability = debounce(async (name: string) => {
    if (!name) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    try {
      const response = await axios.get('/api/check-username-unique', {
        params: { name },
      });
      setUsernameStatus(response.data.success ? 'available' : 'taken');
    } catch (error) {
      setUsernameStatus('error');
      console.error('Error checking username:', error);
    }
  }, 500);

  useEffect(() => {
    return () => {
      checkUsernameAvailability.cancel();
    };
  }, [checkUsernameAvailability]);

  const onSubmit = async (data: SignUpInput) => {
    setApiError(null);
    setApiSuccess(null);
    try {
      const response = await axios.post('/api/sign-up', data);
      if (response.data.success) {
        setApiSuccess(response.data.message);
        toast.success('Success', {
          description: response.data.message,
          className: 'bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
        form.reset();
        setUsernameStatus('idle');
        setTimeout(() => {
          router.replace(`/verify/${data.name}`);
        }, 2000);
      } else {
        setApiError(response.data.message);
        toast.error('Error', {
          description: response.data.message,
          className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
          duration: 4000,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error registering user';
      setApiError(errorMessage);
      toast.error('Error', {
        description: errorMessage,
        className: 'bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80',
        duration: 4000,
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6 md:p-8"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/task-background.jpg')`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md sm:max-w-lg md:max-w-xl"
      >
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-white">
              Join TaskMaster
            </CardTitle>
            <CardDescription className="text-gray-200 text-base">
              Create an account to streamline your productivity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            checkUsernameAvailability(e.target.value);
                          }}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
                        />
                      </FormControl>
                      {usernameStatus === 'checking' && (
                        <p className="text-sm text-gray-300">Checking username...</p>
                      )}
                      {usernameStatus === 'available' && (
                        <p className="text-sm text-green-400">Username is available!</p>
                      )}
                      {usernameStatus === 'taken' && (
                        <p className="text-sm text-red-400">Username is already taken.</p>
                      )}
                      {usernameStatus === 'error' && (
                        <p className="text-sm text-red-400">Error checking username.</p>
                      )}
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                  disabled={form.formState.isSubmitting || usernameStatus === 'taken'}
                >
                  {form.formState.isSubmitting ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-200">
              Already have an account?{' '}
              <a href="/sign-in" className="text-blue-400 hover:underline">
                Sign in
              </a>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}