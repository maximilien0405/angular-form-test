import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { parsePhoneNumber, AsYouType } from 'libphonenumber-js'

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

  public phoneError: boolean;
  public mobileError: boolean;

  public deferredPrompt: any;
  public showButton = false;
  
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
      phone: ['', Validators.pattern('')],
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


  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e: any) {
    console.log(e);
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    this.showButton = true;
  }

  addToHomeScreen() {
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
    .then((choiceResult:any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
    });
    this.deferredPrompt = null;
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

  // Check if phone number is valid
  public checkPhoneFormat(number: any, field: string) {
    if(!number) {
      if(field == 'mobile') {
        this.mobileError = true;
      }
    }

    const phoneNumber = parsePhoneNumber(number)
    if(phoneNumber.isValid() && number.includes('+')) {
      const formattedNumber = new AsYouType().input(number)
      this.form.get(field)?.setValue(formattedNumber)
      if(field == 'mobile') {
        this.mobileError = false;
      } else if(field == 'phone') {
        this.phoneError = false;
      }
    } else {
      if(field == 'mobile') {
        this.mobileError = true;
      } else if(field == 'phone') {
        this.phoneError = true;
      }
    }
  }

  // Methode d'envoi du formulaire
  public submitForm() {
    // Si form déjà entrain d'être submit
    if(this.spinnerDisplay) {
      return;
    }

    // Si form invalid
    if(this.form.invalid || this.phoneError || this.mobileError) {
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
