import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { KeyRound, Languages, Loader2 } from 'lucide-react'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui'
import { emailSchema } from '@/lib/schemas'

const schema = z.object({ email: emailSchema })
type Input = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<Input>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  async function onSubmit() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 400))
    setSubmitting(false)
    toast.info('Demo only — a reset link would be emailed here')
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-4">
      <Link to="/" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
          <Languages className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">LangLeap</h1>
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" /> Forgot password
          </CardTitle>
          <CardDescription>
            Enter the email tied to your account. In this frontend-only build we simulate the reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
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
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                Send reset link
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        <Link to="/login" className="hover:text-foreground">Back to sign in</Link>
      </p>
    </div>
  )
}