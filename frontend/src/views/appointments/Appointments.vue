<template>
  <div class="ams-page">

    <!-- HEADER -->
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h2 class="mb-0">Appointments</h2>
        <p class="text-muted small mb-0">Manage all appointment requests</p>
      </div>
      <router-link to="/appointments/create" class="btn btn-ams">+ New Appointment</router-link>
    </div>

    <!-- FILTERS -->
    <div class="d-flex gap-2 flex-wrap">
      <select v-model="statusFilter" class="form-select" style="max-width:180px">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="rescheduled">Rescheduled</option>
        <option value="completed">Completed</option>
        <option value="canceled">Canceled</option>
      </select>
      <input v-model="search" class="form-control" style="max-width:260px" placeholder="Search by code or client..." />
    </div>

    <!-- TABLE CARD -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0 overflow-auto">
        <div v-if="loading" class="text-center text-muted py-4">Loading...</div>
        <div v-else-if="error" class="alert alert-danger m-3 py-2">{{ error }}</div>
        <table v-else class="table table-hover ams-table mb-0 align-middle">
          <thead class="table-light">
          <tr>
            <th>Business Name</th>
            <th>Service Name</th>
<!--            <th>Notes</th>-->
            <th>Created By</th>
<!--            <th>Approved By</th>-->
            <th>Location</th>
            <th>Start Date</th>
            <th>Start Time</th>
            <th>Status</th>
            <th class="pe-3 text-center" style="min-width:220px">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="appt in filteredAppointments" :key="appt.appointment_code">
            <td>{{ appt.business_name || '—' }}</td>
            <td>{{appt.service_name || '-'}}</td>
<!--            <td>{{ appt.notes || '—' }}</td>-->
            <td>{{appt.creator_name || "-"}}</td>
<!--            <td>{{appt.approver_name || "-"}}</td>-->
            <td>{{appt.location_address || "-"}}</td>
            <td>{{ formatDate(appt.appointment_start_date) }}</td>
            <td>{{ formatTime(appt.start_time) }}</td>
            <td><span :class="['ams-badge', appt.status]">{{ appt.status }}</span></td>
            <td class="pe-3 text-center">
              <div class="d-flex justify-content-center">
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" :aria-expanded="openDropdownCode === appt.appointment_code" @click.stop="toggleActionDropdown(appt.appointment_code)"
                  >
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" :class="{ show: openDropdownCode === appt.appointment_code }">
                    <li><button class="dropdown-item" type="button" @click="openDetails(appt); closeActionDropdown()">View</button></li>
                    <li v-if="appt.status === 'pending'"><button class="dropdown-item" type="button" @click="openApprovalDialog(appt); closeActionDropdown()">Approve</button></li>
                    <li v-if="appt.status === 'approved'"><button class="dropdown-item" type="button" @click="changeStatus(appt, 'in_progress'); closeActionDropdown()">Start</button></li>
                    <li v-if="appt.status === 'in_progress'"><button class="dropdown-item" type="button" @click="changeStatus(appt, 'completed'); closeActionDropdown()">Complete</button></li>
                      <!-- if we want reschedule, cancel or rejected, even after appointment approve, then we add 'approved' in v-if=['']  -->
                    <li v-if="['pending'].includes(appt.status)"><button class="dropdown-item" type="button" @click="openReschedule(appt); closeActionDropdown()">Reschedule</button></li>
                    <li v-if="['pending'].includes(appt.status)"><button class="dropdown-item text-danger" type="button" @click="changeStatus(appt, 'rejected'); closeActionDropdown()">Reject</button></li>
                    <li v-if="['pending'].includes(appt.status)"><button class="dropdown-item" type="button" @click="changeStatus(appt, 'canceled'); closeActionDropdown()">Cancel</button></li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="filteredAppointments.length === 0">
            <td colspan="8" class="text-center text-muted py-4">No appointments found</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DETAILS MODAL -->
    <div v-if="showDetails" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Appointment Details</h5>
            <button type="button" class="btn-close" @click="showDetails = false"></button>
          </div>
          <div class="modal-body" v-if="selected">
            <dl class="row mb-3">
              <dt class="col-5 text-muted">Service Name</dt>
              <dd class="col-7">{{ selected.service_name }}</dd>
              <dt class="col-5 text-muted">Business Name</dt>
              <dd class="col-7">{{ selected.business_name }}</dd>
              <dt class="col-5 text-muted">Start Date</dt>
              <dd class="col-7">{{ formatDate(selected.appointment_start_date) }}</dd>
              <dt class="col-5 text-muted">End Date</dt>
              <dd class="col-7">{{ formatDate(selected.appointment_end_date) }}</dd>
              <dt class="col-5 text-muted">Appointment Time</dt>
              <dd class="col-7">{{ formatTime(selected.start_time) }} - {{ formatTime(selected.end_time) }}</dd>
<!--              <dt class="col-5 text-muted">End Time</dt>-->
<!--              <dd class="col-7">{{ formatTime(selected.end_time) }}</dd>-->
              <dt class="col-5 text-muted">Status</dt>
              <dd class="col-7"><span :class="['ams-badge', selected.status]">{{ selected.status }}</span></dd>
              <template v-if="selected.notes">
                <dt class="col-5 text-muted">Notes</dt>
                <dd class="col-7">{{ selected.notes }}</dd>
              </template>
            </dl>
            <hr class="my-2" />
            <div class="fw-semibold mb-2" style="font-size:13px">History</div>
            <div v-if="historyLoading" class="text-muted small text-center py-2">Loading...</div>
            <ul v-else-if="appointmentHistory.length" class="list-unstyled mb-0">
              <li v-for="h in appointmentHistory" :key="h.id" class="d-flex gap-2 align-items-center mb-1 flex-wrap">
                <span :class="['ams-badge', h.action]">{{ h.action }}</span>
                <span class="text-muted small">by {{ h.changed_by || '—' }}</span>
                <span class="text-muted" style="font-size:11px;min-width:80px">{{ formatDate(h.created_at) }}</span>
              </li>
            </ul>
            <p v-else class="text-muted small mb-0">No history yet</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDetails = false">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- RESCHEDULE MODAL -->
    <div v-if="showReschedule" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reschedule Appointment</h5>
            <button type="button" class="btn-close" @click="showReschedule = false"></button>
          </div>
          <form @submit.prevent="submitReschedule">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-6">
                  <label class="form-label fw-semibold">New Start Date *</label>
                  <input type="date" v-model="rescheduleForm.appointment_start_date" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">New End Date *</label>
                  <input type="date" v-model="rescheduleForm.appointment_end_date" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">Start Time *</label>
                  <input type="time" v-model="rescheduleForm.start_time" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">End Time *</label>
                  <input type="time" v-model="rescheduleForm.end_time" class="form-control" required />
                </div>
              </div>
              <div class="mt-3">
                <label class="form-label fw-semibold">Reason</label>
                <textarea v-model="rescheduleForm.reason" class="form-control" placeholder="Reason for reschedule" rows="3"></textarea>
              </div>
              <p v-if="rescheduleError" class="text-danger small mt-2 mb-0">{{ rescheduleError }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showReschedule = false">Cancel</button>
              <button type="submit" class="btn btn-ams" :disabled="saving">{{ saving ? 'Sending...' : 'Submit Reschedule' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- APPROVAL FLOW MODAL -->
    <div v-if="showApproval" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);z-index:1050">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Approve Appointment &mdash; Staff Availability</h5>
            <button type="button" class="btn-close" @click="closeApprovalDialog"></button>
          </div>
          <div class="modal-body">

            <!-- Appointment summary -->
            <div class="bg-light rounded p-3 mb-3 d-flex flex-wrap gap-3" v-if="selected">
              <div><span class="text-muted small">Service Name</span><div>{{ selected.service_name }}</div></div>
              <div><span class="text-muted small">Start Date</span><div>{{ formatDate(selected.appointment_start_date) }}</div></div>
              <div><span class="text-muted small">End Date</span><div>{{ formatDate(selected.appointment_end_date) }}</div></div>
              <div><span class="text-muted small">Start Time</span><div>{{ formatTime(selected.start_time) }}</div></div>
              <div><span class="text-muted small">End Time</span><div>{{ formatTime(selected.end_time) }}</div></div>
              <div><span class="text-muted small">Location</span><div>{{ selected.location_address || '—' }}</div></div>
            </div>

            <!-- Loading -->
            <div v-if="availabilityLoading" class="text-center text-muted py-4">
              <div class="spinner-border spinner-border-sm me-2"></div> Checking staff availability…
            </div>

            <!-- Error -->
            <div v-else-if="availabilityError" class="alert alert-warning py-2 mb-3">{{ availabilityError }}</div>

            <!-- Staff available -->
            <template v-else-if="!showRescheduleInApproval">
              <div v-if="slotAlreadyBooked" class="alert alert-danger py-2 mb-3">
                This slot is already booked.
                <span v-if="conflictingAppointments.length"> Conflicting appointments: {{ conflictingAppointments.join(', ') }}</span>
              </div>
              <div v-if="availableStaff.length > 0">
                <p class="fw-semibold mb-2">Available staff for this slot:</p>
                <div class="list-group mb-3">
                  <label
                      v-for="s in availableStaff"
                      :key="s.user_code"
                      class="list-group-item list-group-item-action d-flex align-items-center gap-3 cursor-pointer"
                      :class="{ active: selectedStaff === s.user_code }"
                      @click="selectedStaff = s.user_code"
                  >
                    <input type="radio" :value="s.user_code" v-model="selectedStaff" class="form-check-input mt-0" />
                    <div>
                      <div class="fw-semibold">{{ s.staff_name || s.user_code }}</div>
                      <small class="text-muted">{{ s.working_day }} &bull; {{ formatTime(s.start_time) }} – {{ formatTime(s.end_time) }}</small>
                    </div>
                  </label>
                </div>
                <p v-if="approvalError" class="text-danger small mb-2">{{ approvalError }}</p>
              </div>

              <!-- Engaged staff -->
              <div v-if="engagedStaff.length" class="mb-3">
                <p class="fw-semibold mb-2 text-danger">Engaged staff during this slot:</p>
                <div class="list-group">
                  <label
                      v-for="s in engagedStaff"
                      :key="`engaged-${s.user_code}`"
                      class="list-group-item list-group-item-action d-flex align-items-start gap-3 cursor-pointer border-danger"
                      :class="{ active: selectedStaff === s.user_code }"
                      @click="selectedStaff = s.user_code"
                  >
                    <input type="radio" :value="s.user_code" v-model="selectedStaff" class="form-check-input mt-1"/>
                    <div class="flex-grow-1">
                      <div class="fw-semibold d-flex align-items-center gap-2">
                          <span>{{ s.staff_name || s.user_code }}</span>
                          <span class="badge text-bg-danger">Busy</span>
                      </div>

                      <div v-for="a in s.appointments" :key="a.appointment_code" class="small text-muted mt-1">
                        Appointment:<code>{{ a.appointment_code }}</code>
                        &bull; {{ formatTime(a.start_time) }} – {{ formatTime(a.end_time) }}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div v-if="selectedStaff && engagedStaff.some(s => s.user_code === selectedStaff)" class="alert alert-danger py-2 mt-2">
                Warning: selected staff already has another appointment
                during this time slot.
              </div>

              <!--Charges view-->
              <div v-if="autoCharges.length || optionalCharges.length" class="card border-0 bg-light mb-3">
                <div class="card-body">

                  <h6 class="fw-semibold mb-3">Appointment Charges</h6>

                  <!-- Auto Applied -->
                  <div v-if="autoCharges.length" class="mb-3">
                    <div class="fw-semibold text-success mb-2">
                      Automatically Applied Charges
                    </div>

                    <div v-for="charge in autoCharges" :key="charge.charge_code" class="form-check mb-2">
                      <input checked disabled type="checkbox" class="form-check-input">
                      <label class="form-check-label">
                        {{ charge.name }}
                        <span class="text-muted">
                            ( {{ charge.charge_uom === 'percentage' ? `${charge.charge_value}%` : charge.charge_value }} )
                        </span>
                        <span class="badge text-bg-success ms-2">Auto</span>
                      </label>
                    </div>
                  </div>

                  <!-- Optional -->
                  <div v-if="optionalCharges.length">
                    <div class="fw-semibold mb-2">Optional Charges</div>

                    <div v-for="charge in optionalCharges" :key="charge.charge_code" class="form-check mb-2">
                      <input
                          :id="`charge-${charge.charge_code}`"
                          v-model="selectedChargeCodes"
                          :value="charge.charge_code"
                          type="checkbox"
                          class="form-check-input"
                      >

                      <label class="form-check-label" :for="`charge-${charge.charge_code}`">
                        {{ charge.name }}

                        <span class="text-muted">
                            ( {{ charge.charge_uom === 'percentage' ? `${charge.charge_value}%` : charge.charge_value }} )
                        </span>
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              <!-- No staff available -->
              <div v-if="availableStaff.length === 0" class="alert alert-warning py-2"->
                No free staff available for this slot. You may reschedule the appointment and propose one of the alternatives below.
              </div>
                    <!--      options for other slots        -->
              <div v-if="availableStaff.length === 0" class="card mb-3">
                <div class="card-body">
                  <h6 class="fw-semibold mb-3">Choose Alternative Option</h6>

                  <div class="d-flex flex-wrap gap-2">
                    <button class="btn btn-outline-primary" :class="{ active: selectedAlternativeType === 'same_location' }" @click="selectedAlternativeType = 'same_location'">
                      Different Time Same Location
                    </button>

                    <button class="btn btn-outline-primary" :class="{ active: selectedAlternativeType === 'other_location' }" @click="selectedAlternativeType = 'other_location'">
                      Different Location Same Time
                    </button>

                    <button class="btn btn-outline-primary" :class="{ active: selectedAlternativeType === 'service_location' }" @click="selectedAlternativeType = 'service_location'">
                      Service Available At Other Locations
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="availableStaff.length === 0 && selectedAlternativeType === 'same_location' && alternativeTimeSameLocation.length" class="mb-3">
                <div class="fw-semibold mb-2">Other service staff at different time (same location)</div>
                <div class="list-group">
                  <div v-for="s in alternativeTimeSameLocation" :key="`same-${s.user_code}-${s.start_time}-${s.end_time}`" class="list-group-item">
                    <div class="fw-semibold d-flex align-items-center gap-2">
                      <span>{{ s.staff_name || s.user_code }}</span>
                      <span v-if="isRecommendedAlternative(selected?.location_code, s.start_time, s.end_time, s.user_code)" class="badge text-bg-success">Recommended</span>
                    </div>
                    <div class="small text-muted">{{ s.user_code }} &bull; {{ formatTime(s.start_time) }}–{{ formatTime(s.end_time) }}</div>
                    <button type="button" class="btn btn-sm btn-outline-primary mt-2" @click="selectedAlternative = {
                            location_code: selected?.location_code,
                            start_time: s.start_time,
                            end_time: s.end_time
                            }">
                      Select
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="availableStaff.length === 0 && selectedAlternativeType === 'other_location' && alternativeLocationSameTime.length" class="mb-3">
                <div class="fw-semibold mb-2">Other locations at the same time slot</div>
                <div class="border rounded p-2 mb-2" v-for="loc in alternativeLocationSameTime" :key="`loc-${loc.location_code}`">
                  <div class="small mb-2">Location: {{ loc.location?.address || '—' }} &bull; {{ loc.location?.city || '—' }}</div>
                  <button type="button" class="btn btn-sm btn-outline-primary mb-2" @click="selectedAlternative = {
                        location_code: loc.location_code,
                        start_time: selected?.start_time,
                        end_time: selected?.end_time
                      }">
                    Select this Location
                  </button>
                  <div class="list-group">
                    <div v-for="s in loc.staff" :key="`loc-staff-${loc.location_code}-${s.user_code}-${s.start_time}-${s.end_time}`" class="list-group-item">
                      <div class="fw-semibold d-flex align-items-center gap-2">
                        <span>{{ s.staff_name || s.user_code }}</span>
                      </div>
                      <div class="small text-muted">{{ formatTime(s.start_time) }}–{{ formatTime(s.end_time) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="availableStaff.length === 0 && selectedAlternativeType === 'service_location' && serviceLocationsAlternatives.length" class="mb-3">
                <div class="fw-semibold mb-2">Selected service available at other locations</div>
                <div class="border rounded p-2 mb-2" v-for="loc in serviceLocationsAlternatives" :key="`svc-${loc.location_code}`">
                  <div class="small fw-semibold">Location: {{ loc.location_code }}</div>
                  <div class="small text-muted mb-2" v-if="loc.location?.city || loc.location?.address">
                    {{ loc.location?.city || '—' }} &bull; {{ loc.location?.address || '—' }}
                  </div>
                  <div class="small text-muted mb-2">Services: {{ (loc.matched_service_codes || []).join(', ') || '—' }}</div>
                  <div v-if="loc.available_staff_same_slot?.length" class="mb-2">
                    <div class="small fw-semibold">Available at same slot</div>
                    <div class="list-group">
                      <div v-for="s in loc.available_staff_same_slot" :key="`svc-same-${loc.location_code}-${s.user_code}-${s.start_time}-${s.end_time}`" class="list-group-item">
                        <div class="fw-semibold d-flex align-items-center gap-2">
                          <span>{{ s.staff_name || s.user_code }}</span>
                          <span v-if="isRecommendedAlternative(loc.location_code, s.start_time, s.end_time, s.user_code)" class="badge text-bg-success">Recommended</span>
                        </div>
                        <div class="small text-muted">{{ s.user_code }} &bull; {{ formatTime(s.start_time) }}–{{ formatTime(s.end_time) }}</div>
                        <button type="button" class="btn btn-sm btn-outline-primary mt-2" @click="prefillApprovalReschedule({
                                    locationCode: loc.location_code,
                                    startTime: selected?.start_time,
                                    endTime: selected?.end_time
                                  })"
                        >
                          Select Location & Current Time
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-if="loc.alternative_staff_time_slots?.length">
                    <div class="small fw-semibold">Alternative time slots</div>
                    <div class="list-group">
                      <div v-for="s in loc.alternative_staff_time_slots" :key="`svc-alt-${loc.location_code}-${s.user_code}-${s.start_time}-${s.end_time}`" class="list-group-item">
                        <div class="fw-semibold d-flex align-items-center gap-2">
                          <span>{{ s.staff_name || s.user_code }}</span>
                          <span v-if="isRecommendedAlternative(loc.location_code, s.start_time, s.end_time, s.user_code)" class="badge text-bg-success">Recommended</span>
                        </div>
                        <div class="small text-muted">{{ s.user_code }} &bull; {{ formatTime(s.start_time) }}–{{ formatTime(s.end_time) }}</div>
                        <button type="button" class="btn btn-sm btn-outline-primary mt-2"  @click="prefillApprovalReschedule({
                              locationCode: loc.location_code,
                              startTime: s.start_time,
                              endTime: s.end_time
                            })">
                          Select this Location & Slot
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div v-if="selectedAlternative && availableStaff.length === 0" class="alert alert-success mt-3">
                <div class="fw-semibold">Selected Alternative</div>

                <div>Location: {{ selectedAlternative.location_code }}</div>

                <div>Time: {{ formatTime(selectedAlternative.start_time) }} - {{ formatTime(selectedAlternative.end_time) }}</div>

                <button class="btn btn-primary btn-sm mt-2" @click="prefillApprovalReschedule(selectedAlternative)">
                  Continue With Reschedule
                </button>
              </div>
            </template>

            <!-- Reschedule sub-form (shown when no staff OR user clicked "Send Reschedule") -->
            <template v-if="showRescheduleInApproval">
              <div class="alert alert-info py-2 mb-3">
                Fill in a new date &amp; time to propose to the client.
              </div>
              <div class="row g-3">
                <div class="col-6">
                  <label class="form-label fw-semibold">New Start Date *</label>
                  <input type="date" v-model="approvalRescheduleForm.appointment_start_date" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">New End Date *</label>
                  <input type="date" v-model="approvalRescheduleForm.appointment_end_date" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">Start Time *</label>
                  <input type="time" v-model="approvalRescheduleForm.start_time" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label fw-semibold">End Time *</label>
                  <input type="time" v-model="approvalRescheduleForm.end_time" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">Location Code</label>
                  <input type="text" v-model="approvalRescheduleForm.location_code" class="form-control" />
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">Reason / Notes</label>
                  <textarea v-model="approvalRescheduleForm.notes" class="form-control" rows="2" placeholder="Reason for rescheduling…"></textarea>
                </div>
              </div>
              <p v-if="approvalError" class="text-danger small mt-2 mb-0">{{ approvalError }}</p>
            </template>

          </div>

          <!--    Footer buttons      -->
          <div class="modal-footer gap-2">
            <button type="button" class="btn btn-secondary" @click="closeApprovalDialog">Cancel</button>

            <!-- When staff is available and one is selected: Approve -->
            <button v-if="!showRescheduleInApproval && availableStaff.length > 0 || engagedStaff.length >0" class="btn btn-success"
                :disabled="!selectedStaff || approvalSaving"
                @click="submitApproveWithStaff"
            >{{ approvalSaving ? 'Approving…' : 'Approve & Assign Staff' }}</button>

            <!-- When no staff: primary action is reschedule -->
            <button v-if="!showRescheduleInApproval && availableStaff.length === 0 && engagedStaff.length === 0 && !availabilityLoading && !availabilityError"
                class="btn btn-primary" @click="showRescheduleInApproval = true">Send Reschedule Request to Client</button>
            <!-- Back button when reschedule form is open -->
            <button v-if="showRescheduleInApproval" class="btn btn-outline-secondary" @click="showRescheduleInApproval = false">&#8592; Back</button>

            <!-- Submit reschedule -->
            <button v-if="showRescheduleInApproval" class="btn btn-primary" :disabled="approvalSaving" @click="submitApprovalReschedule">
              {{ approvalSaving ? 'Sending…' : 'Send Reschedule Request' }}</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import api from '@/utils/api'
import formatTime from "../../utils/formatTime.js";
import formatDate from "../../utils/formatDate.js";

const appointments = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const rescheduleError = ref('')

const search = ref('')
const statusFilter = ref('')
const openDropdownCode = ref('')

const showDetails = ref(false)
const showReschedule = ref(false)
const selected = ref(null)
const historyLoading = ref(false)
const appointmentHistory = ref([])

const rescheduleForm = reactive({
  appointment_start_date: '',
  appointment_end_date: '',
  start_time: '',
  end_time: '',
  reason: '',
})

// fetch appointments
async function fetchAppointments() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/appointments/get-all-appointments', {
      params: {
        include: "business,creator,approver,services,services.service,location"
      }
    })
    console.log(res)

    appointments.value = (res.data.data || []).map((appt) => ({
      ...appt,
      business_name: appt.business?.name || '',
      service_name: (appt.services || []).map((s) => s.service?.name).filter(Boolean).join(', '),
      creator_name: appt.creator?.name || '',
      approver_name: appt.approver?.name || '',
      location_address: appt.location?.address + " " +  appt.location?.street + " " + appt.location?.city || '',
    }))
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load appointments'
  } finally {
    loading.value = false
  }
}

const filteredAppointments = computed(() => {
  return appointments.value.filter(a => {
    const s = search.value.toLowerCase()
    const matchSearch = !s ||
        (a.appointment_code || '').toLowerCase().includes(s) ||
        (a.client_name || '').toLowerCase().includes(s)
    const matchStatus = !statusFilter.value || a.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

async function openDetails(appt) {
  selected.value = appt
  appointmentHistory.value = []
  showDetails.value = true
  historyLoading.value = true
  try {
    const res = await api.get(`/appointments/get-appointment-history/${appt.appointment_code}`, {
          params: {
            include : "changedByUser"
          }
        })
    appointmentHistory.value = (res.data.data || []).map((appt) => ({
      ...appt,
      changed_by: appt.changedByUser?.name || '',
    }))
  } catch (_) {
  } finally {
    historyLoading.value = false
  }
}

function openReschedule(appt) {
  selected.value = appt
  rescheduleForm.appointment_start_date = appt.appointment_start_date || ''
  rescheduleForm.appointment_end_date = appt.appointment_end_date || ''
  rescheduleForm.start_time = appt.start_time || ''
  rescheduleForm.end_time = appt.end_time || ''
  rescheduleForm.reason = ''
  rescheduleError.value = ''
  showReschedule.value = true
}

async function changeStatus(appt, status) {
  try {
    await api.patch(`/appointments/update-appointment-status/${appt.appointment_code}`, { status })
    appt.status = status
  } catch (err) {
    error.value = err.response?.data?.message || 'Status update failed'
  }
}

async function submitReschedule() {
  saving.value = true
  rescheduleError.value = ''
  try {
    await api.post(`/appointments/reschedule-appointment/${selected.value.appointment_code}`, rescheduleForm)
    showReschedule.value = false
    await fetchAppointments()
  } catch (err) {
    rescheduleError.value = err.response?.data?.message || 'Reschedule failed'
  } finally {
    saving.value = false
  }
}

// ─── Approval Flow ────────────────────────────────────────────────────────────

const showApproval = ref(false)
const availabilityLoading = ref(false)
const availabilityError = ref('')
const availableStaff = ref([])
const engagedStaff = ref([])
const slotAlreadyBooked = ref(false)
const conflictingAppointments = ref([])
const alternativeTimeSameLocation = ref([])
const alternativeLocationSameTime = ref([])
const serviceLocationsAlternatives = ref([])
const recommendedAlternativeKey = ref('')
const selectedStaff = ref('')
const approvalSaving = ref(false)
const approvalError = ref('')
const showRescheduleInApproval = ref(false)
const autoCharges = ref([])
const optionalCharges = ref([])
const selectedChargeCodes = ref([])
const selectedAlternativeType = ref('')
const selectedAlternative = ref(null)

const approvalRescheduleForm = reactive({
  appointment_start_date: '',
  appointment_end_date: '',
  start_time: '',
  end_time: '',
  location_code: '',
  notes: '',
})

function toDateInput(v) {
  return String(v || '').split('T')[0] || ''
}

function toTimeInput(v) {
  return String(v || '').slice(0, 5) || ''
}

function slotTimeValue(v) {
  const normalized = toTimeInput(v)
  const [h, m] = normalized.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return Number.MAX_SAFE_INTEGER
  return h * 60 + m
}

function slotKey(locationCode, startTime, endTime, userCode) {
  return [locationCode || '', toTimeInput(startTime), toTimeInput(endTime), userCode || ''].join('|')
}

function isRecommendedAlternative(locationCode, startTime, endTime, userCode) {
  return recommendedAlternativeKey.value !== '' && recommendedAlternativeKey.value === slotKey(locationCode, startTime, endTime, userCode)
}

function sortAlternativeSlots(slots, locationCode) {
  return [...(slots || [])].sort((a, b) => {
    const aPriority = isRecommendedAlternative(locationCode, a.start_time, a.end_time, a.user_code) ? 0 : 1
    const bPriority = isRecommendedAlternative(locationCode, b.start_time, b.end_time, b.user_code) ? 0 : 1
    if (aPriority !== bPriority) return aPriority - bPriority
    return slotTimeValue(a.start_time) - slotTimeValue(b.start_time)
  })
}

function applyRecommendationOrdering() {
  alternativeTimeSameLocation.value = sortAlternativeSlots(
      alternativeTimeSameLocation.value,
      selected.value?.location_code
  )

  alternativeLocationSameTime.value = (alternativeLocationSameTime.value || []).map((loc) => ({
    ...loc,
    staff: sortAlternativeSlots(loc.staff, loc.location_code),
  }))

  serviceLocationsAlternatives.value = (serviceLocationsAlternatives.value || []).map((loc) => ({
    ...loc,
    available_staff_same_slot: sortAlternativeSlots(loc.available_staff_same_slot, loc.location_code),
    alternative_staff_time_slots: sortAlternativeSlots(loc.alternative_staff_time_slots, loc.location_code),
  }))
}

function pickRecommendedAlternative() {
  const candidates = []

  for (const s of alternativeTimeSameLocation.value || []) {
    candidates.push({
      key: slotKey(selected.value?.location_code, s.start_time, s.end_time, s.user_code),
      time: slotTimeValue(s.start_time),
      priority: 1,
    })
  }

  for (const loc of alternativeLocationSameTime.value || []) {
    for (const s of loc.staff || []) {
      candidates.push({
        key: slotKey(loc.location_code, s.start_time, s.end_time, s.user_code),
        time: slotTimeValue(s.start_time),
        priority: 2,
      })
    }
  }

  for (const loc of serviceLocationsAlternatives.value || []) {
    for (const s of loc.available_staff_same_slot || []) {
      candidates.push({
        key: slotKey(loc.location_code, s.start_time, s.end_time, s.user_code),
        time: slotTimeValue(s.start_time),
        priority: 3,
      })
    }

    for (const s of loc.alternative_staff_time_slots || []) {
      candidates.push({
        key: slotKey(loc.location_code, s.start_time, s.end_time, s.user_code),
        time: slotTimeValue(s.start_time),
        priority: 4,
      })
    }
  }

  candidates.sort((a, b) => a.time - b.time || a.priority - b.priority)
  recommendedAlternativeKey.value = candidates[0]?.key || ''
  applyRecommendationOrdering()
}

function selectAlternative(option) {
  selectedAlternative.value = option
}

async function openApprovalDialog(appt) {
  selected.value = appt
  showApproval.value = true
  await loadApprovalAvailability(appt)
}

async function loadApprovalAvailability(appt) {
  availabilityError.value = ''
  availableStaff.value = []
  engagedStaff.value = []
  autoCharges.value = []
  optionalCharges.value = []
  selectedAlternativeType.value = ''
  selectedAlternative.value = null
  selectedChargeCodes.value = []
  slotAlreadyBooked.value = false
  conflictingAppointments.value = []
  alternativeTimeSameLocation.value = []
  alternativeLocationSameTime.value = []
  serviceLocationsAlternatives.value = []
  recommendedAlternativeKey.value = ''
  selectedStaff.value = ''
  approvalError.value = ''
  showRescheduleInApproval.value = false
  approvalRescheduleForm.appointment_start_date = toDateInput(appt.appointment_start_date)
  approvalRescheduleForm.appointment_end_date = toDateInput(appt.appointment_end_date || appt.appointment_start_date)
  approvalRescheduleForm.start_time = toTimeInput(appt.start_time)
  approvalRescheduleForm.end_time = toTimeInput(appt.end_time)
  approvalRescheduleForm.location_code = appt.location_code || ''
  approvalRescheduleForm.notes = ''

  availabilityLoading.value = true
  try {
    const res = await api.get(`/appointments/check-availability/${appt.appointment_code}`)
    const payload = res.data.data || {}
    availableStaff.value = payload.available_staff || []
    engagedStaff.value = payload.engaged_staff || []
    autoCharges.value = payload.charges?.auto_apply || []
    optionalCharges.value = payload.charges?.optional || []

// no optional charges selected initially
    selectedChargeCodes.value = []
    slotAlreadyBooked.value = Boolean(payload.location_slot_already_booked)
    conflictingAppointments.value = payload.conflicting_appointments || []
    alternativeTimeSameLocation.value = payload.alternatives?.different_time_same_location || []
    alternativeLocationSameTime.value = payload.alternatives?.different_location_same_time || []
    serviceLocationsAlternatives.value = payload.alternatives?.selected_service_other_locations || []
    pickRecommendedAlternative()
  } catch (err) {
    availabilityError.value = err.response?.data?.message || 'Could not check availability'
  } finally {
    availabilityLoading.value = false
  }
}

function closeApprovalDialog() {
  showApproval.value = false
  showRescheduleInApproval.value = false
  selectedAlternativeType.value = ''
  selectedAlternative.value = null
  approvalError.value = ''
}

async function submitApproveWithStaff() {
  if (!selectedStaff.value) return
  approvalSaving.value = true
  approvalError.value = ''
  try {
    await api.post(`/appointments/approve-appointment/${selected.value.appointment_code}`,
        {
          staff_code: selectedStaff.value,
          selected_charge_codes: selectedChargeCodes.value
        })
    showApproval.value = false
    await fetchAppointments()
  } catch (err) {
    approvalError.value = err.response?.data?.message || 'Approval failed'
    if (selected.value?.appointment_code) {
      await loadApprovalAvailability(selected.value)
    }
  } finally {
    approvalSaving.value = false
  }
}

async function submitApprovalReschedule() {
  if (!approvalRescheduleForm.appointment_start_date || !approvalRescheduleForm.start_time || !approvalRescheduleForm.end_time) {
    approvalError.value = 'Please fill in the new date and times'
    return
  }
  approvalSaving.value = true
  approvalError.value = ''
  try {
    await api.post(`/appointments/reschedule-appointment/${selected.value.appointment_code}`, approvalRescheduleForm)
    showApproval.value = false
    await fetchAppointments()
  } catch (err) {
    approvalError.value = err.response?.data?.message || 'Reschedule request failed'
  } finally {
    approvalSaving.value = false
  }
}

function prefillApprovalReschedule({ locationCode, startTime, endTime }) {
  approvalRescheduleForm.appointment_start_date = toDateInput(selected.value?.appointment_start_date)
  approvalRescheduleForm.appointment_end_date = toDateInput(selected.value?.appointment_end_date || selected.value?.appointment_start_date)
  approvalRescheduleForm.start_time = toTimeInput(startTime)
  approvalRescheduleForm.end_time = toTimeInput(endTime)
  approvalRescheduleForm.location_code = locationCode || selected.value?.location_code || ''
  showRescheduleInApproval.value = true
  approvalError.value = ''
}

function toggleActionDropdown(appointmentCode) {
  openDropdownCode.value = openDropdownCode.value === appointmentCode ? '' : appointmentCode
}

function closeActionDropdown() {
  openDropdownCode.value = ''
}

onMounted(fetchAppointments)
</script>

<style scoped>
.dropdown-menu {
  min-width: 180px;
}
</style>