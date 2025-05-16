import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { UserRole } from '../../../core/models/user.model';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface RoleWithPermissions {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault?: boolean;
  isSystem?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-role-management-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatChipsModule,
    MatTableModule,
    MatTooltipModule,
    MatDividerModule,
    MatExpansionModule
  ],
  templateUrl: './role-management-dialog.component.html',
  styleUrls: ['./role-management-dialog.component.scss']
})
export class RoleManagementDialogComponent implements OnInit {
  roles: RoleWithPermissions[] = [];
  permissions: Permission[] = [];
  displayedColumns: string[] = ['name', 'description', 'permissionCount', 'actions'];
  selectedRole: RoleWithPermissions | null = null;
  roleForm: FormGroup;
  editMode = false;

  // Groupes de modules pour organiser les permissions
  modules = [
    'Utilisateurs',
    'Vulnérabilités',
    'Menaces',
    'Actifs',
    'Rapports',
    'Configuration',
    'Audit'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RoleManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      permissions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Initialiser les rôles prédéfinis
    this.roles = [
      {
        id: '1',
        name: 'Administrateur',
        description: 'Accès complet à toutes les fonctionnalités',
        permissions: ['all'],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Analyste',
        description: 'Peut analyser les vulnérabilités et les menaces',
        permissions: ['view_vulnerabilities', 'view_threats', 'create_reports'],
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Client',
        description: 'Accès limité aux données de son instance',
        permissions: ['view_own_data', 'view_reports'],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Super Utilisateur',
        description: 'Accès étendu mais pas complet',
        permissions: ['view_all', 'edit_vulnerabilities', 'edit_threats', 'manage_users'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Initialiser les permissions disponibles
    this.permissions = [
      { id: 'view_users', name: 'Voir les utilisateurs', description: 'Permet de voir la liste des utilisateurs', module: 'Utilisateurs' },
      { id: 'create_users', name: 'Créer des utilisateurs', description: 'Permet de créer de nouveaux utilisateurs', module: 'Utilisateurs' },
      { id: 'edit_users', name: 'Modifier les utilisateurs', description: 'Permet de modifier les utilisateurs existants', module: 'Utilisateurs' },
      { id: 'delete_users', name: 'Supprimer des utilisateurs', description: 'Permet de supprimer des utilisateurs', module: 'Utilisateurs' },
      { id: 'manage_roles', name: 'Gérer les rôles', description: 'Permet de gérer les rôles et les permissions', module: 'Utilisateurs' },

      { id: 'view_vulnerabilities', name: 'Voir les vulnérabilités', description: 'Permet de voir les vulnérabilités', module: 'Vulnérabilités' },
      { id: 'create_vulnerabilities', name: 'Créer des vulnérabilités', description: 'Permet de créer de nouvelles vulnérabilités', module: 'Vulnérabilités' },
      { id: 'edit_vulnerabilities', name: 'Modifier les vulnérabilités', description: 'Permet de modifier les vulnérabilités existantes', module: 'Vulnérabilités' },
      { id: 'delete_vulnerabilities', name: 'Supprimer des vulnérabilités', description: 'Permet de supprimer des vulnérabilités', module: 'Vulnérabilités' },

      { id: 'view_threats', name: 'Voir les menaces', description: 'Permet de voir les menaces', module: 'Menaces' },
      { id: 'create_threats', name: 'Créer des menaces', description: 'Permet de créer de nouvelles menaces', module: 'Menaces' },
      { id: 'edit_threats', name: 'Modifier les menaces', description: 'Permet de modifier les menaces existantes', module: 'Menaces' },
      { id: 'delete_threats', name: 'Supprimer des menaces', description: 'Permet de supprimer des menaces', module: 'Menaces' },

      { id: 'view_assets', name: 'Voir les actifs', description: 'Permet de voir les actifs', module: 'Actifs' },
      { id: 'create_assets', name: 'Créer des actifs', description: 'Permet de créer de nouveaux actifs', module: 'Actifs' },
      { id: 'edit_assets', name: 'Modifier les actifs', description: 'Permet de modifier les actifs existants', module: 'Actifs' },
      { id: 'delete_assets', name: 'Supprimer des actifs', description: 'Permet de supprimer des actifs', module: 'Actifs' },

      { id: 'view_reports', name: 'Voir les rapports', description: 'Permet de voir les rapports', module: 'Rapports' },
      { id: 'create_reports', name: 'Créer des rapports', description: 'Permet de créer de nouveaux rapports', module: 'Rapports' },
      { id: 'export_reports', name: 'Exporter les rapports', description: 'Permet d\'exporter les rapports', module: 'Rapports' },

      { id: 'view_config', name: 'Voir la configuration', description: 'Permet de voir la configuration', module: 'Configuration' },
      { id: 'edit_config', name: 'Modifier la configuration', description: 'Permet de modifier la configuration', module: 'Configuration' },

      { id: 'view_audit', name: 'Voir les logs d\'audit', description: 'Permet de voir les logs d\'audit', module: 'Audit' },
      { id: 'export_audit', name: 'Exporter les logs d\'audit', description: 'Permet d\'exporter les logs d\'audit', module: 'Audit' }
    ];
  }

  get permissionsFormArray(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }

  getPermissionsByModule(module: string): Permission[] {
    return this.permissions.filter(p => p.module === module);
  }

  selectRole(role: RoleWithPermissions): void {
    this.selectedRole = role;
    this.editMode = true;

    // Réinitialiser le formulaire
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });

    // Réinitialiser les permissions
    while (this.permissionsFormArray.length) {
      this.permissionsFormArray.removeAt(0);
    }

    // Ajouter les permissions existantes
    this.permissions.forEach(permission => {
      const isSelected = role.permissions.includes(permission.id) || role.permissions.includes('all');
      this.permissionsFormArray.push(this.fb.control(isSelected));
    });
  }

  createNewRole(): void {
    this.selectedRole = null;
    this.editMode = false;

    // Réinitialiser le formulaire
    this.roleForm.reset({
      name: '',
      description: ''
    });

    // Réinitialiser les permissions
    while (this.permissionsFormArray.length) {
      this.permissionsFormArray.removeAt(0);
    }

    // Ajouter des permissions vides
    this.permissions.forEach(() => {
      this.permissionsFormArray.push(this.fb.control(false));
    });
  }

  saveRole(): void {
    if (this.roleForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.roleForm.controls).forEach(key => {
        const control = this.roleForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const selectedPermissions = this.permissions
      .filter((_, i) => this.permissionsFormArray.at(i).value)
      .map(p => p.id);

    if (this.editMode && this.selectedRole) {
      // Mettre à jour un rôle existant
      const updatedRole: RoleWithPermissions = {
        ...this.selectedRole,
        name: this.roleForm.value.name,
        description: this.roleForm.value.description,
        permissions: selectedPermissions,
        updatedAt: new Date()
      };

      const index = this.roles.findIndex(r => r.id === this.selectedRole!.id);
      if (index !== -1) {
        this.roles[index] = updatedRole;
      }

      this.selectedRole = null;
      this.editMode = false;
    } else {
      // Créer un nouveau rôle
      const newRole: RoleWithPermissions = {
        id: Date.now().toString(),
        name: this.roleForm.value.name,
        description: this.roleForm.value.description,
        permissions: selectedPermissions,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.roles.push(newRole);
      this.selectedRole = null;
    }

    this.roleForm.reset();
  }

  deleteRole(role: RoleWithPermissions): void {
    if (role.isSystem) {
      alert('Impossible de supprimer un rôle système');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`)) {
      const index = this.roles.findIndex(r => r.id === role.id);
      if (index !== -1) {
        this.roles.splice(index, 1);
      }

      if (this.selectedRole && this.selectedRole.id === role.id) {
        this.selectedRole = null;
        this.editMode = false;
        this.roleForm.reset();
      }
    }
  }

  cancelEdit(): void {
    this.selectedRole = null;
    this.editMode = false;
    this.roleForm.reset();
  }

  onClose(): void {
    this.dialogRef.close(this.roles);
  }

  getPermissionCount(role: RoleWithPermissions): number {
    if (role.permissions.includes('all')) {
      return this.permissions.length;
    }
    return role.permissions.length;
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.selectedRole?.permissions.includes(permissionId) ||
           this.selectedRole?.permissions.includes('all') ||
           false;
  }
}
