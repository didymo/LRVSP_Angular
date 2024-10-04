import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import { trigger, transition, style, animate } from '@angular/animations';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../_services/auth.service";
@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class LoginComponent {
  formGroup = new FormGroup({
    userid: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })

  constructor(private authService: AuthService, private router: Router) {
  }

  onSubmit() {
    const formValues = this.formGroup.value;
    this.authService.login(formValues.userid!, formValues.password!).subscribe(
      (r) => {
        this.router.navigate(['/fileManagement'])
      }
    )
  }
}
