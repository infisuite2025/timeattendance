import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app/theme.dart';
import 'core/api_client.dart';
import 'core/app_state.dart';
import 'features/auth/login_screen.dart';
import 'features/shell/shell_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const InfiTimeProApp());
}

class InfiTimeProApp extends StatelessWidget {
  const InfiTimeProApp({super.key, this.api});

  final WorkspaceApi? api;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState(api: api),
      child: MaterialApp(
        title: 'InfiTimePro',
        debugShowCheckedModeBanner: false,
        theme: buildAppTheme(),
        home: const _RootGate(),
      ),
    );
  }
}

class _RootGate extends StatelessWidget {
  const _RootGate();

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    if (!state.ready) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return state.signedIn ? const ShellScreen() : const LoginScreen();
  }
}
