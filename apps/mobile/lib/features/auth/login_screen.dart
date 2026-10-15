import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/theme.dart';
import '../../core/api_client.dart';
import '../../core/app_state.dart';
import '../../core/demo_data.dart';
import '../../shared/feedback.dart';
import '../../shared/widgets.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _remember = true;
  bool _busy = false;
  String _organization = DemoData.organizations.first.name;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final state = context.read<AppState>();
      final notice = state.sessionNotice;
      if (notice == null || notice.isEmpty) return;
      state.clearSessionNotice();
      showAppToast(context, notice, duration: const Duration(seconds: 5));
    });
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      await context.read<AppState>().signIn(
            nextEmail: _email.text,
            nextOrganization: _organization,
            remember: _remember,
            password: _password.text,
          );
    } on ApiException catch (error) {
      if (mounted) {
        showAppToast(context, error.message, error: true);
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _forgot() async {
    final email = TextEditingController(text: _email.text);
    await showDialog<void>(
      context: context,
      builder: (context) {
        return AppDialog(
          title: 'Forgot password?',
          message: 'Password resets are sent by your workspace administrator. This app does not email a reset link on its own.',
          icon: Icons.lock_reset_rounded,
          alignCenter: false,
          body: TextField(
            controller: email,
            decoration: const InputDecoration(labelText: 'Work email'),
            keyboardType: TextInputType.emailAddress,
          ),
          actions: [
            OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
            FilledButton(
              onPressed: () {
                Navigator.pop(context);
                showAppToast(this.context, 'Ask your administrator to reset this workspace password.', warning: true);
              },
              child: const Text('Request reset'),
            ),
          ],
        );
      },
    );
    email.dispose();
  }

  Future<void> _sso() async {
    final proceed = await showAppConfirm(
      context,
      title: 'Continue with a local session?',
      message:
          'Microsoft sign-in is handled by the workspace server. This build keeps the session on the device, so you can continue with a local demo session for the selected organization.',
      confirmLabel: 'Continue',
      icon: Icons.window_outlined,
    );
    if (proceed != true || !mounted) return;
    if (_email.text.trim().isEmpty || _password.text.trim().isEmpty) {
      showAppToast(context, 'Enter your work email and password first.', warning: true);
      return;
    }
    await context.read<AppState>().signIn(
          nextEmail: _email.text,
          nextOrganization: _organization,
          remember: _remember,
          password: _password.text,
        );
  }

  @override
  Widget build(BuildContext context) {
    final connectionError = context.watch<AppState>().connectionError;
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
            children: [
              const SizedBox(height: 12),
              Center(
                child: Image.asset(
                  'assets/brand/app_logo.png',
                  width: 56,
                  height: 56,
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'InfiTimePro',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600, letterSpacing: -0.4),
              ),
              const SizedBox(height: 8),
              const Text(
                'Welcome Back! Sign in to access your InfiTimePro account and manage your workforce.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, height: 1.4, color: AppColors.slate500),
              ),
              const SizedBox(height: 10),
              Text(
                'Punches and requests from this phone are saved to\n${workspaceBaseUrl()}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, height: 1.35, color: AppColors.slate500),
              ),
              const SizedBox(height: 28),
              if (connectionError != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.roseSoft,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.rose.withValues(alpha: 0.35)),
                  ),
                  child: Text(connectionError, style: const TextStyle(fontSize: 13, height: 1.35, color: AppColors.rose)),
                ),
                const SizedBox(height: 14),
              ],
              AppDropdown<String>(
                value: _organization,
                label: 'Organization / Company',
                itemHeight: 56,
                items: [
                  for (final org in DemoData.organizations)
                    DropdownMenuItem(
                      value: org.name,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(org.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                          Text(org.domain, style: const TextStyle(fontSize: 11, color: AppColors.slate500, fontWeight: FontWeight.w500)),
                        ],
                      ),
                    ),
                ],
                onChanged: (value) => setState(() => _organization = value ?? _organization),
              ),
              const SizedBox(height: 14),
              TextFormField(
                key: const Key('emailField'),
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Email Address or Employee ID',
                  prefixIcon: Icon(Icons.badge_outlined),
                ),
                validator: (value) {
                  final text = value?.trim() ?? '';
                  if (text.isEmpty) return 'Enter your email or employee ID';
                  return null;
                },
              ),
              const SizedBox(height: 14),
              TextFormField(
                key: const Key('passwordField'),
                controller: _password,
                obscureText: _obscure,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    onPressed: () => setState(() => _obscure = !_obscure),
                    icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                  ),
                ),
                validator: (value) {
                  if ((value ?? '').length < 8) return 'Use at least 8 characters';
                  return null;
                },
                onFieldSubmitted: (_) => _submit(),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Checkbox(
                    value: _remember,
                    visualDensity: VisualDensity.compact,
                    onChanged: (value) => setState(() => _remember = value ?? false),
                  ),
                  const Expanded(child: Text('Remember me', style: TextStyle(fontSize: 13))),
                  TextButton(
                    style: TextButton.styleFrom(visualDensity: VisualDensity.compact, padding: const EdgeInsets.symmetric(horizontal: 4)),
                    onPressed: _forgot,
                    child: const Text('Forgot password?'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              FilledButton(
                key: const Key('signInButton'),
                onPressed: _busy ? null : _submit,
                child: Text(_busy ? 'Signing in…' : 'Sign In'),
              ),
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: _busy ? null : _sso,
                icon: const Icon(Icons.window_outlined, size: 18),
                label: const Text('Sign in with Microsoft (SSO)'),
              ),
              const SizedBox(height: 28),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.slate50,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.line),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.shield_outlined, color: AppColors.primary),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Secure enterprise access. Your session stays on this device.',
                        style: TextStyle(fontSize: 12, height: 1.35, color: AppColors.slate700),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
