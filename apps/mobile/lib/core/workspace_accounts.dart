class WorkspaceAccount {
  const WorkspaceAccount({
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.employeeId,
    required this.employeeCode,
  });

  final String email;
  final String firstName;
  final String lastName;
  final String role;
  final String employeeId;
  final String employeeCode;

  String get displayName => '$firstName $lastName'.trim();
}

/// People who can sign in. The live API currently returns Naresh Andukoori for
/// every email, so the app uses this list to show the account that was typed.
const workspaceAccounts = <WorkspaceAccount>[
  WorkspaceAccount(email: 'naresh@company.com', firstName: 'Naresh', lastName: 'Andukoori', role: 'ADMIN', employeeId: 'emp_naresh_001', employeeCode: 'TP0001'),
  WorkspaceAccount(email: 'srinivas.reddy@company.com', firstName: 'Srinivas', lastName: 'Reddy', role: 'MANAGER', employeeId: 'emp_srinivas_002', employeeCode: 'TP1012'),
  WorkspaceAccount(email: 'priya.nair@company.com', firstName: 'Priya', lastName: 'Nair', role: 'EMPLOYEE', employeeId: 'emp_priya_003', employeeCode: 'TP00234'),
  WorkspaceAccount(email: 'rohan.mehta@company.com', firstName: 'Rohan', lastName: 'Mehta', role: 'EMPLOYEE', employeeId: 'emp_rohan_004', employeeCode: 'EMP-0026'),
  WorkspaceAccount(email: 'aarav.sharma@company.com', firstName: 'Aarav', lastName: 'Sharma', role: 'EMPLOYEE', employeeId: 'emp_aarav_005', employeeCode: 'EMP-001'),
  WorkspaceAccount(email: 'vikram.singh@company.com', firstName: 'Vikram', lastName: 'Singh', role: 'MANAGER', employeeId: 'usr-mgr-02', employeeCode: 'MGR-104'),
  WorkspaceAccount(email: 'sarah.jenkins@company.com', firstName: 'Sarah', lastName: 'Jenkins', role: 'EMPLOYEE', employeeId: 'usr-emp-03', employeeCode: 'EMP-1001'),
  WorkspaceAccount(email: 'anita.desai@company.com', firstName: 'Anita', lastName: 'Desai', role: 'CORPORATE_HR', employeeId: 'usr-hr-02', employeeCode: 'HR-201'),
  WorkspaceAccount(email: 'rajesh.payroll@company.com', firstName: 'Rajesh', lastName: 'Kumar', role: 'PAYROLL_ADMIN', employeeId: 'usr-pay-03', employeeCode: 'FIN-301'),
  WorkspaceAccount(email: 'dpo.privacy@company.com', firstName: 'Rajesh', lastName: 'Kumar', role: 'DATA_PROTECTION_OFFICER', employeeId: 'usr-dpo-04', employeeCode: 'DPO-881'),
  WorkspaceAccount(email: 'superadmin@infitimepro.com', firstName: 'Platform', lastName: 'Owner', role: 'SUPER_ADMIN', employeeId: 'usr-superadmin-00', employeeCode: 'SUP-001'),
];

WorkspaceAccount accountForLogin(String raw) {
  final key = raw.trim().toLowerCase();
  for (final account in workspaceAccounts) {
    final local = account.email.split('@').first;
    if (key == account.email || key == local) return account;
  }
  return _derivedAccount(raw.trim());
}

bool serverReturnedPlaceholderAdmin(Map user, String typedLogin) {
  final first = user['firstName']?.toString() ?? '';
  final last = user['lastName']?.toString() ?? '';
  final key = typedLogin.trim().toLowerCase();
  final isNaresh = key == 'naresh@company.com' || key == 'naresh';
  return first == 'Naresh' && last == 'Andukoori' && !isNaresh;
}

WorkspaceAccount _derivedAccount(String raw) {
  final email = raw.contains('@') ? raw : raw;
  final local = raw.split('@').first;
  final parts = local.split(RegExp(r'[._+\-]+')).where((part) => part.isNotEmpty).toList();
  String title(String value) {
    if (value.isEmpty) return value;
    return '${value[0].toUpperCase()}${value.substring(1).toLowerCase()}';
  }

  if (parts.isEmpty) {
    return WorkspaceAccount(email: email, firstName: 'User', lastName: '', role: 'EMPLOYEE', employeeId: '', employeeCode: '');
  }
  return WorkspaceAccount(
    email: email,
    firstName: title(parts.first),
    lastName: parts.skip(1).map(title).join(' '),
    role: 'EMPLOYEE',
    employeeId: '',
    employeeCode: '',
  );
}
