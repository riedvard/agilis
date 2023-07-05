import {TestBed} from '@angular/core/testing';
import {AngularFireModule} from '@angular/fire/compat';
import {RouterTestingModule} from '@angular/router/testing';

import {AuthService} from './auth.service';
import {AngularFireDatabaseModule} from "@angular/fire/compat/database";
import {environment} from "../../../environments/environment";

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,],
    });
    service = TestBed.inject(AuthService);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
