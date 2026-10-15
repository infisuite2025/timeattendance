import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:infi_timepro_mobile/core/api_client.dart';
import 'package:infi_timepro_mobile/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

class _FakeApi extends WorkspaceApi {
  @override
  Future<Map<String, dynamic>> login({required String email, required String password}) async {
    return {
      'token': 'test-token',
      'user': {
        'email': email,
        'firstName': 'Priya',
        'lastName': 'Nair',
        'tenantId': 'ten_acme_001',
        'employeeId': 'emp-001',
      },
    };
  }

  @override
  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async => [];

  @override
  Future<dynamic> post(String path, Map<String, dynamic> body) async => {'message': 'ok'};
}

class _NareshApi extends WorkspaceApi {
  @override
  Future<Map<String, dynamic>> login({required String email, required String password}) async {
    return {
      'token': 'test-token',
      'user': {
        'email': email,
        'firstName': 'Naresh',
        'lastName': 'Andukoori',
        'role': 'ADMIN',
        'tenantId': 'ten_acme_001',
        'employeeId': 'emp_naresh_001',
      },
    };
  }

  @override
  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async => [];

  @override
  Future<dynamic> post(String path, Map<String, dynamic> body) async => {'message': 'ok'};
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('sign in opens the home screen', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(InfiTimeProApp(api: _FakeApi()));
    await tester.pump();

    expect(find.text('Sign In'), findsOneWidget);
    await tester.enterText(find.byKey(const Key('emailField')), 'priya.nair@company.com');
    await tester.enterText(find.byKey(const Key('passwordField')), 'password1');
    await tester.tap(find.byKey(const Key('signInButton')));
    await tester.pumpAndSettle();

    expect(find.textContaining('Priya'), findsWidgets);

    await tester.tap(find.widgetWithText(NavigationDestination, 'Attendance'));
    await tester.pumpAndSettle();
    expect(find.text('My Attendance'), findsOneWidget);

    await tester.tap(find.widgetWithText(NavigationDestination, 'Requests'));
    await tester.pumpAndSettle();
    expect(find.text('Raise Request'), findsOneWidget);

    expect(find.widgetWithText(NavigationDestination, 'Team'), findsNothing);

    await tester.tap(find.widgetWithText(NavigationDestination, 'More'));
    await tester.pumpAndSettle();
    expect(find.text('Shift Library'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Sign out'), 400);
    expect(find.text('Sign out'), findsOneWidget);
  });

  testWidgets('login shows the typed user when the server always returns Naresh', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(InfiTimeProApp(api: _NareshApi()));
    await tester.pump();

    await tester.enterText(find.byKey(const Key('emailField')), 'priya.nair@company.com');
    await tester.enterText(find.byKey(const Key('passwordField')), 'password1');
    await tester.tap(find.byKey(const Key('signInButton')));
    await tester.pumpAndSettle();

    expect(find.textContaining('Priya'), findsWidgets);
    expect(find.textContaining('Naresh'), findsNothing);
  });
}