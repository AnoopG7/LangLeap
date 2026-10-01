import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Languages, Loader2, UserPlus } from 'lucide-react'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PasswordInput,
  Separator,
} from '@/components/ui'
import { signInSchema, signUpSchema, type SignInInput } from '@/lib/schemas'
import { useAuthStore } from '@/stores'
import { QUICK_FILL, canAccessPath } from '@/data/users'

type Mode = 'signin' | 'signup'

const signUpFormSchema = signUpSchema
  .extend({ confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
type SignUpFormInput = z.infer<typeof signUpFormSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const authError = useAuthStore((s) => s.error)
  const authLoading = useAuthStore((s) => s.isLoading)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState<Mode>('signin')

  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const signUpForm = useForm<SignUpFormInput>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { email: '', password: '', fullName: '', confirmPassword: '', firstLanguage: 'hindi' },
  })

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmitSignIn(values: SignInInput) {
    setSubmitting(true)
    try {
      await signIn(values)
      toast.success('Signed in successfully')
      // Send users to the page they asked for only if their role may open it;
      // otherwise land on the role-aware dashboard instead of a 403 dead-end.
      const me = useAuthStore.getState().user
      const dest = me && from && canAccessPath(me.role, from) ? from : '/dashboard'
      navigate(dest, { replace: true })
    } catch {
      // error surfaced via store.error
    } finally {
      setSubmitting(false)
    }
  }

  async function onSubmitSignUp(payload: SignUpFormInput) {
    setSubmitting(true)
    try {
      await signUp(payload)
      toast.success('Learner account created — sign in to continue')
      setMode('signin')
      signUpForm.reset()
      signInForm.reset()
    } catch {
      // error surfaced via store.error
    } finally {
      setSubmitting(false)
    }
  }

  function quickFill(email: string, password: string) {
    signInForm.setValue('email', email)
    signInForm.setValue('password', password)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-4">
      <Link to="/" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
          <Languages className="size-6" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">LangLeap</h1>
          <p className="text-sm text-muted-foreground">English for Hindi &amp; Marathi speakers</p>
        </div>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === 'signin' ? 'Sign in' : 'Create learner account'}</CardTitle>
          <CardDescription>
            {mode === 'signin'
              ? 'Enter your credentials to open the learner app.'
              : 'Learner accounts can sign in immediately. Studio roles are granted by an administrator.'}
          </CardDescription>
        </CardHeader>

        {mode === 'signin' ? (
          <>
            <CardContent className="grid gap-4">
              <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Demo accounts (tap to fill)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_FILL.map((a) => (
                    <Button
                      key={a.email}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px]"
                      onClick={() => quickFill(a.email, a.password)}
                    >
                      {a.label}
                    </Button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Passwords: <span className="font-medium">Learner@123, Writer@123, Artist@123, Reviewer@123,</span>{' '}
                  <span className="font-medium">Admin@123, ProductHead@123</span> — or tap a button to autofill.
                </p>
              </div>
              <Separator />
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSubmitSignIn)} className="grid gap-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@langleap.app" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="••••••••" autoComplete="current-password" {...field} />
                        </FormControl>
                        {authError && <FormMessage>{authError}</FormMessage>}
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={authLoading || submitting}>
                    {(authLoading || submitting) && <Loader2 className="animate-spin" />}
                    Sign in
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3 text-sm">
              <div className="flex justify-between">
                <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setMode('signup')}>
                <UserPlus className="size-4 mr-1.5" />
                New here? Create a learner account
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardContent>
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSubmitSignUp)} className="grid gap-4">
                  <FormField
                    control={signUpForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" autoComplete="name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="firstLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First language (आपकी भाषा / आपली भाषा)</FormLabel>
                        <div className="flex gap-2">
                          {(
                            [
                              { value: 'hindi', label: 'हिंदी (Hindi)' },
                              { value: 'marathi', label: 'मराठी (Marathi)' },
                            ] as const
                          ).map((lang) => (
                            <Button
                              key={lang.value}
                              type="button"
                              variant={field.value === lang.value ? 'default' : 'outline'}
                              size="sm"
                              className="h-9 flex-1"
                              onClick={() => field.onChange(lang.value)}
                            >
                              {lang.label}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="Minimum 8 characters" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="Re-enter your password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Right now this demo app is frontend-only — your account is stored in this browser. Studio
                    roles (writer, artist, reviewer) are granted by an admin in the full product.
                  </p>
                  <Button type="submit" disabled={authLoading || submitting}>
                    {(authLoading || submitting) && <Loader2 className="animate-spin" />}
                    Create account
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="justify-center text-sm">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setMode('signin')}
                className="text-muted-foreground hover:text-foreground"
              >
                Already have an account? Sign in
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}