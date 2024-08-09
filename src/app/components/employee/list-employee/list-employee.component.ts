<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <div *ngIf="loading" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.5);">
    <div class="spinner-border" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <div class="container">
    <h1>Empleados</h1>
    <hr>
    <div>
        <div class="row">
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button class="btn btn-success" (click)="openCreateEmployee()">
                    Agregar
                </button>  
                <button class="btn btn-danger" (click)="downloadList()">
                    Descargar
                </button> 
              </div>
        </div>
        <h4>Filtrar:</h4>
        <div class="row">
            <div class="col-md-4">
                <input type="text" class="form-control" id="validationServer01" placeholder="Legajo, Nombre, Apellido, Documento"
                [(ngModel)]="inputForFilter" (input)="callfilterInput($event)">
              </div>
              <div class="col-md-4">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="flexCheckDefault" [(ngModel)]="flagActive" (click)="callFilterActives($event)">
                  <label class="form-check-label" for="flexCheckDefault">
                    Activos
                  </label>
                </div>
              </div>
        </div>
    </div>
    <br>
    <hr>
    <table class="table">
        <thead>
            <tr>
                <th scope="col" class="text-center">Legajo</th>
                <th scope="col" class="text-center">Nombre</th>
                <th scope="col" class="text-center">Apellido</th>
                <th scope="col" class="text-center">Documento</th>
                <th scope="col" class="text-center">Estado</th>
                <th scope="col" class="text-center">Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr *ngFor="let e of pagination">
                <td class="text-center">{{e.id}}</td>
                <td class="text-center">{{ e.firstName }}</td>
                <td class="text-center">{{ e.lastName }}</td>
                <td class="text-center">{{ e.documentNumber }}</td>
                <td *ngIf="e.isActive" class="text-center"><span class="material-symbols-outlined" style="color: rgb(3, 139, 3);">
                  check_circle
                </span></td>
                <td *ngIf="!e.isActive" class="text-center"><span style="color: rgb(202, 0, 0);" class="material-symbols-outlined">
                  cancel
              </span></td>   
              <td class="text-center">
                <div class="dropdown">
                  <button type="button" class="btn btn-light" data-bs-toggle="dropdown" aria-expanded="false">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                      <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                    </svg>
                  </button>
                  <div class="dropdown-content text-left">
                    <a (click)="openUpdate(e)">Actualizar</a>
      
                    <a *ngIf="e.isActive" (click)="showConfirmationDelete(e)">Eliminar</a>
                    <a *ngIf="!e.isActive" (click)="showConfirmationActive(e)">Activar</a>
                  </div>
                </div>
              </td>
            </tr>
        </tbody>
    </table>
    <nav aria-label="Page navigation example" class="my-pagination">
      <ul class="pagination justify-content-center mb-4">
        <li class="page-item" [class.disabled]="currentPage === 1">
          <a class="page-link" (click)="pageChanged(currentPage - 1)" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item" *ngFor="let page of pages" [class.active]="currentPage === page">
          <a class="page-link" (click)="pageChanged(page)">{{ page }}</a>
        </li>
        <li class="page-item" [class.disabled]="currentPage === totalPages">
          <a class="page-link" (click)="pageChanged(currentPage + 1)" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
</div>

<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
<!-- Popper.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
<!-- Bootstrap JS -->
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
