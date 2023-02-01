import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  public allCours: any = [];
  public form: FormGroup;
  public errorForm: boolean;
  public spinnerDisplay: boolean;
  public year: number = new Date().getFullYear();
  public sucess: boolean;
  private readonly API_URL = environment.apiUrl;
  private readonly DATABASE_NAME = environment.database;
  private readonly TOKEN = environment.jwtToken;

  constructor(private http: HttpClient, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    // Définition des champs
    this.form = this.formBuilder.group({
      civ: ['', Validators.required],
      lastname: ['', Validators.required],
      firstname: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', Validators.required],
      country: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      mobile: ['', Validators.required],
      birthdate: ['', Validators.required],
      nationality: ['', Validators.required],
      swiss_orig: [''],
      prof: [''],
      learning: [''],
      lesson: ['', Validators.required],
      notes: [''],
    })

    // On récupère les cours du backend Tryton
    this.getCours().subscribe((res: any) => {
      this.allCours = res;
      this.form.get('lesson')?.setValue(res[0].text)
    });
  }

  // Méthode pour get les cours
  public getCours(): Observable<any> {
    return this.http.get(`${this.API_URL}/${this.DATABASE_NAME}/registration/check`, { headers: { 'Authorization': `Bearer ${this.TOKEN}`}})
  }

  // Méthode pour créer une registration
  public createRegistration(item: object): Observable<any> {
    const data = { item }
    return this.http.post(`${this.API_URL}/${this.DATABASE_NAME}/registration/check`, data, { headers: { 'Authorization': `Bearer ${this.TOKEN}`}, responseType: 'text'}, )
  }

  // Methode d'envoi du formulaire
  public submitForm() {
    // Si form déjà entrain d'être submit
    if(this.spinnerDisplay) {
      return;
    }

    // Si form invalid
    if(this.form.invalid) {
      this.errorForm = true;
    } 
    else {
      this.spinnerDisplay = true;

      // Change les valeurs champ CIV
      if(this.form.get('civ')?.value == 'Monsieur') {
        this.form.get('civ')?.setValue('mr')
      } else {
        this.form.get('civ')?.setValue('mrs')
      }

      this.createRegistration(this.form.value).subscribe((res: any) => {
        if(res == 'ok') {
          setTimeout(() => {
            this.sucess = true;
          }, 300);
        }
      });
    }
  }
}
