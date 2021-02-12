import { Component, Input, Output, EventEmitter, ElementRef,  Inject, AfterViewInit, ViewChild} from '@angular/core';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector:   'data-table',
    template:   '<div class="dataTables_wrapper dt-bootstrap no-footer">' +
                    '<div *ngIf="refreshTable"><i class="fa fa-refresh fa-spin" style="font-size:24px"></i></div>' +
                    '<div class="row">' +
                        '<div class="col-sm-12">'+
                            '<ng-content>'+
                            '</ng-content>'+                           
                        '</div>' +
                    '</div>' +
                    '<div class="row">' +
                        '<div class="col-sm-6 full_page_counter">' +
                            '<div class="dataTables_length" id="DataTables_Table_0_length">' +
                                '<label class="mr-3">' +
                                    '<select name="DataTables_Table_0_length" [(ngModel)]="filter.pageSize" (change)="filterChanged(true)" aria-controls="DataTables_Table_0" class="form-control">' +
                                        '<option value="5">5</option>' +
                                        '<option value="10">10</option>' +
                                        '<option value="15">15</option>' +
                                        '<option value="20">20</option>' +
                                    '</select>' +
                                '</label>' +
                                '<label> Showing <strong>{{(filter.pageIndex - 1) * filter.pageSize + 1}}</strong>-<strong>{{filter.pageIndex * filter.pageSize > totalItems ? totalItems : filter.pageIndex * filter.pageSize}}</strong> of <strong>{{totalItems}}</strong></label>'+
                            '</div>' +
                            '<div class="dataTables_info" id="DataTables_Table_0_info" role="status" aria-live="polite"></div>' +
                        '</div>' +
                        '<div class="col-sm-6 main_pageing text-right">' +
                            '<div class="dataTables_paginate paging_simple_numbers" id="DataTables_Table_0_paginate">' +
                                '<pagination [totalItems]="totalItems" [maxSize]="3" [itemsPerPage]="filter.pageSize"  [boundaryLinks]="true" (pageChanged)="CurrentPage = $event.page; filterChanged(false)" [(ngModel)]="CurrentPage" aria-label="Default pagination"></pagination>'+
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'    
})

export class DatatableComponent implements AfterViewInit {

    @Input()
    showSearchFeild = true;
    @Input()
    pageSize: number;
    @Input()
    sortField: string;
    @Input()
    sortOrder: number;
    @Input()
    totalItems: number;
    @Input()
    tableName: string;
    @Output()
    onFilterChange = new EventEmitter();
    @Output()
    onActionButton = new EventEmitter();

    @ViewChild('input', {static: false}) input: ElementRef;

    newTitle : string;
    CurrentPage: any = 1;
    filter: any;
    refreshTable = false;
    searchType = 1;
    searchText1: string;

    ngOnInit() {
        this.filter = { pageIndex: 1, pageSize: 10, searchText: '', sortField: '', sortOrder: 0 };
        if (this.pageSize) this.filter.pageSize = this.pageSize;
        if (this.sortField) this.filter.sortField = this.sortField;
        if (this.sortOrder) this.filter.sortOrder = this.sortOrder;
        //this.filterChanged(true);
    }

    ngAfterViewInit(){
        // if (this.input) {
        //     this.input.nativeElement
        //     .pipe(debounceTime(500))
        //     .subscribe(model => this.updateSearchField(model));
        // }
    }

    updateSearchField(value){
        this.filter.searchText = value;
        this.filterChanged(true);
    }

    filterChanged(refilter) {
        if (refilter == false) {
            this.filter.pageIndex = this.CurrentPage;
        }
        this.onFilterChange.emit(this.filter);
    }

    refresh() {
        this.filterChanged(false);
    }

    actionButton(buttonName) {
        this.onActionButton.emit(buttonName);
    }
}

@Component({
    selector: '[sort-field]',
    template: '<div [ngClass]="{\'sorting\': filter.sortField != sortField, \'sorting_asc\': filter.sortOrder == 0 && filter.sortField == sortField, \'sorting_desc\': filter.sortOrder == 1 && filter.sortField == sortField }" (click)="sortClicked($event)"><ng-content></ng-content></div>',
    host: { 'class': 'text-center' }
})
export class DatatableSortFieldComponent {
    sortField: string;
    filter: any;

    constructor( @Inject(DatatableComponent) private parent: DatatableComponent, private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.filter = this.parent.filter;
        this.sortField = this.elementRef.nativeElement.getAttribute('sort-field');
    }

    sortClicked(event) {
        if (this.filter.sortField === this.sortField) {
            this.filter.sortOrder = this.filter.sortOrder === 1 ? 0 : 1;
        } else {
            this.filter.sortField = this.sortField;
            this.filter.sortOrder = 0;
        }
        this.parent.filterChanged(true);
    }
}
