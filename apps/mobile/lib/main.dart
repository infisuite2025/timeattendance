import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app/theme.dart';
import 'core/api_client.dart';
import 'core/app_state.dart';
import 'core/push_messaging.dart';
import 'features/auth/login_screen.dart';
import 'features/shell/shell_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await PushMessaging.start();
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

class _RootGate extends StatefulWidget {
  const _RootGate();

  @override
  State<_RootGate> createState() => _RootGateState();
}

class _RootGateState extends State<_RootGate> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state != AppLifecycleState.resumed) return;
    final app = context.read<AppState>();
    app.refreshClock();
    if (app.signedIn) app.loadWorkspace();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    if (!state.ready) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return state.signedIn ? const ShellScreen() : const LoginScreen();
  }
}
